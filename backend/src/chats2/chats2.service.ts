import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomEntity, ChatMembershipEntity, ChatMsgEntity } from './chatEntities.entity';
import { ChatRoom, ChatMembership, ChatMsg } from './chats.interface';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/user.entity';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, JoinChatRoomDto } from './chats.dto';

@Injectable()
export class Chats2Service {

    constructor(
        @InjectRepository(ChatRoomEntity)
        private readonly chatRoomsRepo: Repository<ChatRoomEntity>,
        @InjectRepository(ChatMembershipEntity)
        private readonly chatMembershipsRepo: Repository<ChatMembershipEntity>,
        @InjectRepository(ChatMsgEntity)
        private readonly chatMsgsRepo: Repository<ChatMsgEntity>,
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) { }

    async getChatRoom(roomDto: ChatRoomDto): Promise<ChatRoom> {
        // check whether the room name is already taken
        const existingRoom = await this.chatRoomsRepo.findOne({ where: { name: roomDto.name } })
        if (existingRoom) {
            return existingRoom
        }

        // create room
        const room = await this.chatRoomsRepo.save({
            name: roomDto.name,
            isPrivate: roomDto.isPrivate,
            password: roomDto.password ? bcrypt.hashSync(roomDto.password, 10) : null,
            isDirect: roomDto.isDirect ? roomDto.isDirect : false,
        })

        return room
    }

    findAllChatRooms(): Promise<ChatRoom[]> {
        return this.chatRoomsRepo.find();
    }

    findChatRoomById(id: number): Promise<ChatRoom> {
        return this.chatRoomsRepo.findOne({ where: { id: id } })
    }

    findChatRoomByName(name: string): Promise<ChatRoom> {
        return this.chatRoomsRepo.findOne({ where: { name: name } })
    }

    async findUserChatRooms(userId: string): Promise<ChatRoom[]> {
        const res = await this.chatMembershipsRepo.createQueryBuilder('membership')
            .leftJoinAndSelect('membership.chatRoom', 'chatRoom')
            .leftJoinAndSelect('membership.user', 'user')
            .where('user.id = :userId', { userId: userId })
            .getMany()

        var rooms = []
        res.forEach(element => {
            rooms.push(element.chatRoom)
        });

        return rooms
    }

    async joinUser2GeneralChat(userId: string) {
        var generalChat: ChatRoom = await this.findChatRoomByName(process.env.GENERAL_CHAT_NAME)
        if (!generalChat) {
            const generalChatRoomDto: ChatRoomDto = {
                name: process.env.GENERAL_CHAT_NAME,
                isPrivate: false,
                password: "",
            }
            generalChat = await this.getChatRoom(generalChatRoomDto)
        }
        const membership: ChatMembershipDto = {
            userId: userId,
            chatRoomId: generalChat.id,
            isAdmin: false,
        }
        this.joinChatRoom(generalChat.id, membership)
    }

    async joinChatRoom(id: number, data: JoinChatRoomDto): Promise<ChatMembership> {

        // find if the user is already a member of the room
        const userMembership = await this.chatMembershipsRepo.find({
            where: {
                user: { id: data.userId },
                chatRoom: { id: id }
            }
        })
        if (userMembership.length > 0) {
            return this.chatMembershipsRepo.findOne(
                {
                    where: { id: userMembership[0].id },
                    relations: ['user', 'chatRoom'],
                })
        }

        // if the room is private, check the password
        const room = await this.chatRoomsRepo.findOne({ where: { id: id } })
        if (room.isPrivate) {
            if (!data.password) {
                throw new Error('Password is required for this room')
            }
            if (!bcrypt.compareSync(data.password, room.password)) {
                throw new Error('Password is incorrect')
            }
        }

        // create a new membership
        const user = await this.usersRepo.findOne({ where: { id: data.userId } });
        // if no other membership exists, make the user the owner
        const memberships = await this.findChatRoomMembers(id)
        let isOwner = false;
        let isAdmin = false;
        if (memberships.length == 0) {
            isOwner = true;
            isAdmin = true;
        }

        const membership = await this.chatMembershipsRepo.save({
            user: user,
            chatRoom: room,
            isOwner: isOwner,
            isAdmin: isAdmin,
        })

        return this.chatMembershipsRepo.findOne({
            where: { id: membership.id },
            relations: ['user', 'chatRoom'],
        })
    }

    async inviteUser(id: number, inviteeId: string) {
        this.joinChatRoom(id, { userId: inviteeId })
    }


    findChatRoomMembers(id: number): Promise<ChatMembership[]> {
        return this.chatMembershipsRepo.find({
            where: { chatRoom: { id: id } },
            relations: ['user', 'chatRoom']
        })
    }

    async findUserMemberships(userId: string): Promise<ChatMembership[]> {

        const res = await this.chatMembershipsRepo.find({
            where: { user: { id: userId } },
            relations: ['user', 'chatRoom'],
            // select: ['id', 'isAdmin', 'isBanned', 'bannedUntil', 'isMuted', 'mutedUntil', 'chatRoom.id', 'user.id'] NOT WORKING 
        })

        // transform the result into ChatMembershipDtos
        var memberships = []
        res.forEach(element => {
            memberships.push({
                id: element.id,
                isAdmin: element.isAdmin,
                isBanned: element.isBanned,
                // bannedUntil: element.bannedUntil,
                isMuted: element.isMuted,
                // mutedUntil: element.mutedUntil,
                chatRoomId: element.chatRoom.id,
                userId: element.user.id,
                chatRoomName: element.chatRoom.name,
                userName: element.user.username
            })
            delete element.chatRoom
            delete element.user
        })

        return memberships
    }

    async updateMembership(id: number, data: ChatMembershipDto) {
        delete data.chatRoomId
        return this.chatMembershipsRepo.update({ id: id }, data)
    }

    async deleteMembership(chatRoomId: number, userId: string) {
        const res = await this.chatMembershipsRepo.delete({ chatRoom: { id: chatRoomId }, user: { id: userId } })
        // if the user is the last member of the room, delete the room
        const memberships = await this.findChatRoomMembers(chatRoomId)
        if (memberships.length == 0) {
            this.chatRoomsRepo.delete(chatRoomId)
        }
        return res
    }

    async createChatRoomMessage(msg: ChatMsgDto): Promise<ChatMsg> {
        const sender = await this.usersRepo.findOne({ where: { id: msg.senderId } });
        const room = await this.chatRoomsRepo.findOne({ where: { id: msg.chatRoomId } });
        const postedMsg = await this.chatMsgsRepo.save({
            sender: sender,
            chatRoom: room,
            content: msg.content
        })

        return postedMsg
    }

    async findChatRoomMessages(roomId: number): Promise<ChatMsgDto[]> {
        const msgs = await this.chatMsgsRepo.find({
            where: { chatRoom: { id: roomId } },
            relations: ['sender', 'chatRoom']
        })

        let outMsgs: ChatMsgDto[] = []
        for (let i = 0; i < msgs.length; i++) {
            const element = msgs[i]
            outMsgs.push({
                senderId: element.sender.id,
                senderName: element.sender.username,
                chatRoomId: element.chatRoom.id,
                content: element.content,
                createdAt: element.createdAt
            })
        }

        return outMsgs
    }
}
