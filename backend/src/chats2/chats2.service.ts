import { HttpException, Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomEntity, ChatMembershipEntity, ChatMsgEntity } from './chatEntities.entity';
import { ChatRoom, ChatMembership, ChatMsg } from './chats.interface';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/user.entity';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, JoinChatRoomDto } from './chats.dto';
import { User } from 'src/users/user.interface';
import { JwtAdminGuard } from 'src/auth/jwt-admin-guard';
import { isPastDate } from 'src/utils/utils';
import { HttpStatusCode } from 'axios';

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

    async createChatRoom(roomDto: ChatRoomDto, user: User = null): Promise<ChatRoom> {
        // check whether the room name is already taken
        const existingRoom = await this.chatRoomsRepo.findOne({ where: { name: roomDto.name } })
        if (existingRoom) {
            throw new HttpException('Room name already taken', 409)
        }

        // create room
        const room = await this.chatRoomsRepo.save({
            name: roomDto.name,
            isPrivate: roomDto.isPrivate,
            password: roomDto.password ? bcrypt.hashSync(roomDto.password, 10) : null,
            isDirect: roomDto.isDirect ? roomDto.isDirect : false,
        })

        // if a user is provided add it as owner to the room
        if (user) {
            await this.chatMembershipsRepo.save({
                user: { id: user.id },
                chatRoom: { id: room.id },
                isOwner: true,
            })
        }

        return room
    }

    async updateChatRoomPassword(user: User, roomId: number, password: string) {
        // check user belongs to the room and is owner
        const userMembership = await this.chatMembershipsRepo.find({
            where: {
                user: { id: user.id },
                chatRoom: { id: roomId },
                isOwner: true,
            }
        })

        if (userMembership.length == 0) {
            throw new UnauthorizedException()
        }

        const room = await this.chatRoomsRepo.findOne({ where: { id: roomId } })
        if (!room) {
            return new NotFoundException()
        }

        if (password == "") {
            room.password = null
            room.isPrivate = false
        }
        else {
            room.password = bcrypt.hashSync(password, 10)
            room.isPrivate = true
        }

        return await this.chatRoomsRepo.save(room)
    }

    @UseGuards(JwtAdminGuard)
    async findAllChatRooms(): Promise<ChatRoom[]> {
        const rooms = await this.chatRoomsRepo.find()

        return rooms
    }

    findChatRoomById(id: number): Promise<ChatRoom> {
        return this.chatRoomsRepo.findOne({ where: { id: id } })
    }

    findChatRoomByName(name: string): Promise<ChatRoom> {
        return this.chatRoomsRepo.findOne({ where: { name: name } })
    }

    async getDirectChatRoom(userId1: string, userId2: string): Promise<ChatRoom> {
        // find the chat room with the two users that is private
        const chatRoom = await this.chatRoomsRepo
            .createQueryBuilder('chatRoom')
            .innerJoin('chatRoom.memberships', 'membership1')
            .innerJoin('chatRoom.memberships', 'membership2')
            .where('chatRoom.isDirect = :isDirect', { isDirect: true })
            .andWhere('membership1.user.id = :userId1', { userId1: userId1 })
            .andWhere('membership2.user.id = :userId2', { userId2: userId2 })
            .getOne();

        if (chatRoom) {
            return chatRoom
        }

        const u1 = await this.usersRepo.findOne({ where: { id: userId1 } })
        const u2 = await this.usersRepo.findOne({ where: { id: userId2 } })

        const names = [u1.username, u2.username]
        names.sort()
        const roomName = "directMessage¿" + names[0] + "¿" + names[1]
        // if no room is found create one
        const roomDto: ChatRoomDto = {
            name: roomName,
            password: "",
            isDirect: true,
        }
        const roomCreated = await this.createChatRoom(roomDto)
        const membershipDto1: ChatMembershipDto = {
            userId: userId1,
            chatRoomId: roomCreated.id,
            isAdmin: false,
            isOwner: false,
        }
        const membershipDto2: ChatMembershipDto = {
            userId: userId2,
            chatRoomId: roomCreated.id,
            isAdmin: false,
            isOwner: false,
        }
        await this.joinChatRoom(roomCreated.id, membershipDto1)
        await this.joinChatRoom(roomCreated.id, membershipDto2)
        return roomCreated
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

    // called when a user is created
    async joinUser2GeneralChat(userId: string) {
        var generalChat: ChatRoom = await this.findChatRoomByName(process.env.GENERAL_CHAT_NAME)
        if (!generalChat) {
            const generalChatRoomDto: ChatRoomDto = {
                name: process.env.GENERAL_CHAT_NAME,
                isPrivate: false,
                password: "",
            }
            generalChat = await this.createChatRoom(generalChatRoomDto)
        }
        const membership: ChatMembershipDto = {
            userId: userId,
            chatRoomId: generalChat.id,
            isAdmin: false,
        }
        this.joinChatRoom(generalChat.id, membership)
    }

    async joinChatRoom(roomId: number, data: JoinChatRoomDto): Promise<ChatMembership> {
        // check whether the room exists
        const roomExists = await this.chatRoomsRepo.findOne({ where: { id: roomId } })
        if (!roomExists) {
            throw new NotFoundException('Room does not exist')
        }

        // find if the user is already a member of the room
        const userMembership = await this.chatMembershipsRepo.find({
            where: {
                user: { id: data.userId },
                chatRoom: { id: roomId }
            }
        })

        if (userMembership.length > 0) {
            return this.chatMembershipsRepo.findOne(
                {
                    where: { id: userMembership[0].id },
                    relations: ['user', 'chatRoom'],
                })
        }

        const room = await this.chatRoomsRepo.findOne({ where: { id: roomId } })

        // if it is a direct room, check if there are already two members
        if (room.isDirect) {
            const roomMemberships = await this.findChatRoomMembers(roomId)
            if (roomMemberships.length >= 2) {
                throw new UnauthorizedException('You are not allowed to join this room')
            }
        }

        // if the room is private, check the password
        if (room.isPrivate) {
            if (!data.password) {
                throw new UnauthorizedException('Password is required for this room')
            }
            if (!bcrypt.compareSync(data.password, room.password)) {
                throw new UnauthorizedException('Password is incorrect')
            }
        }

        // create a new membership
        const user = await this.usersRepo.findOne({ where: { id: data.userId } });
        // if no other membership exists, make the user the owner
        const memberships = await this.findChatRoomMembers(roomId)
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

    async inviteUser(inviter: User, id: number, data: any) {
        // check user belongs to the room and is not banned
        const userMembership = await this.chatMembershipsRepo.find({
            where: {
                user: { id: inviter.id },
                chatRoom: { id: id },
                isBanned: false,
            }
        })

        if (userMembership.length == 0) {
            throw new UnauthorizedException('You are not a member of this room')
        }

        this.joinChatRoom(id, data)
    }


    async findChatMembershipById(id: number): Promise<ChatMembership> {
        const res = await this.chatMembershipsRepo.findOne({
            where: { id: id },
            relations: ['user', 'chatRoom'],
        })
        if (!res) {
            throw new NotFoundException('Membership not found')
        }
        return res
    }

    findChatRoomMembers(id: number): Promise<ChatMembership[]> {
        const res = this.chatMembershipsRepo.find({
            where: { chatRoom: { id: id } },
            relations: ['user', 'chatRoom']
        })

        // update isBanned and isMutted fields for each member depending on the date
        res.then(memberships => {
            memberships.forEach(membership => {
                if (isPastDate(membership.bannedUntil)) {
                    membership.isBanned = false
                    this.chatMembershipsRepo.save(membership)
                }
                if (isPastDate(membership.mutedUntil)) {
                    membership.isMuted = false
                    this.chatMembershipsRepo.save(membership)
                }
            })
        })

        return res
    }

    async findUserMemberships(userId: string): Promise<ChatMembership[]> {
        const res = this.chatMembershipsRepo.find({
            where: { user: { id: userId } },
            relations: ['user', 'chatRoom'],
        })

        // update isBanned and isMutted fields for each member depending on the date

        res.then(memberships => {
            memberships.forEach(membership => {
                if (isPastDate(membership.bannedUntil)) {
                    membership.isBanned = false
                    this.chatMembershipsRepo.save(membership)
                }
                if (isPastDate(membership.mutedUntil)) {
                    membership.isMuted = false
                    this.chatMembershipsRepo.save(membership)
                }
            })
        })

        return res
    }

    async updateMembership(id: number, data: ChatMembershipDto) {

        if (!data.isBanned)
            data.bannedUntil = new Date()
        if (!data.isMuted)
            data.mutedUntil = new Date()

        delete data.chatRoomId
        delete data.user

        const res = this.chatMembershipsRepo.update({ id: id }, data)
        return res
    }

    async getUserChatMembership(userId: string, chatRoomId: number) {
        return await this.chatMembershipsRepo.findOne({
            where: {
                user: { id: userId },
                chatRoom: { id: chatRoomId }
            }
        })
    }

    async setIsBanned(userId: string, chatRoomId: number, isBanned: boolean) {
        const membership = await this.getUserChatMembership(userId, chatRoomId)

        membership.isBanned = isBanned;
        membership.bannedUntil = isBanned ? new Date(3000, 0, 1) : new Date()
        membership.save();
    }

    async setIsAdmin(userId: string, chatRoomId: number, isAdmin: boolean) {
        const membership = await this.getUserChatMembership(userId, chatRoomId)

        membership.isAdmin = isAdmin;
        membership.save();
        this.setIsBanned(userId, chatRoomId, !isAdmin)
    }

    async deleteMembership(id: number) {
        const membership = await this.chatMembershipsRepo.findOne({ where: { id: id }, relations: ['chatRoom'] })
        const room = membership.chatRoom

        const res = await this.chatMembershipsRepo.delete({ id: id })
        // if the user is the last member of the room, delete the room
        const memberships = await this.findChatRoomMembers(room.id)
        if (memberships.length == 0) {
            this.chatRoomsRepo.delete(room.id)
        }
        return res
    }

    async leaveRoom(chatRoomId: number, userId: string) {
        // if user is owner of the room, delete the room
        const membership = await this.getUserChatMembership(userId, chatRoomId)
        if (membership.isOwner) {
            return this.deleteRoom(chatRoomId)
        }
        const res = await this.chatMembershipsRepo.delete({ chatRoom: { id: chatRoomId }, user: { id: userId } })
        // if the user is the last member of the room, delete the room
        const memberships = await this.findChatRoomMembers(chatRoomId)
        if (memberships.length == 0) {
            this.chatRoomsRepo.delete(chatRoomId)
        }
        return res
    }

    async deleteRoom(chatRoomId: number) {
        await this.chatMembershipsRepo.delete({ chatRoom: { id: chatRoomId } })
        await this.chatMsgsRepo.delete({ chatRoom: { id: chatRoomId } })
        this.chatRoomsRepo.delete(chatRoomId);
    }

    async createChatRoomMessage(token: any, msg: ChatMsgDto): Promise<ChatMsg> {
        const sender = await this.usersRepo.findOne({ where: { id: msg.senderId } });
        const room = await this.chatRoomsRepo.findOne({ where: { id: msg.chatRoomId } });
        const membership = await this.chatMembershipsRepo.findOne({
            where: {
                user: { id: token.userId },
                chatRoom: { id: msg.chatRoomId },
            }
        })



        if (token.role === 'ADMIN' || token.role === 'OWNER') {
            const postedMsg = await this.chatMsgsRepo.save({
                sender: sender,
                chatRoom: room,
                content: msg.content
            })
            return postedMsg
        }

        if (!membership || !isPastDate(membership.bannedUntil))
            throw new HttpException('You are not allowed to post messages in this room', HttpStatusCode.Unauthorized)
        if (!isPastDate(membership.mutedUntil))
            throw new HttpException('You are muted in this room', HttpStatusCode.Unauthorized)

        const postedMsg = await this.chatMsgsRepo.save({
            sender: sender,
            chatRoom: room,
            content: msg.content
        })

        return postedMsg
    }

    async findChatRoomMessages(token: any, roomId: number): Promise<ChatMsgDto[]> {
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

        if (token.role === 'ADMIN' || token.role === 'OWNER')
            return outMsgs

        const membership = await this.getUserChatMembership(token.userId, roomId)
        if (!membership)
            throw new HttpException('You are not a member of this room', HttpStatusCode.Unauthorized)

        console.log(membership.bannedUntil)
        if (!isPastDate(membership.bannedUntil))
            throw new HttpException('You have been banned from this room', HttpStatusCode.Unauthorized)

        return outMsgs
    }
}
