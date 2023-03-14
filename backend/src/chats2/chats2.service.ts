import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomEntity, ChatMembershipEntity, ChatMsgEntity, DirectMsgEntity, DuologueEntity } from './chatEntities.entity';
import { ChatRoom, ChatMembership, ChatMsg, Duologue, DirectMsg } from './chats.interface';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/user.entity';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, DirectMsgDto, DuologueDto, JoinChatRoomDto } from './chats.dto';
import { Logger2 } from 'src/utils/Logger2';
import { Console } from 'console';

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
        @InjectRepository(DuologueEntity)
        private readonly duologuesRepo: Repository<DuologueEntity>,
        @InjectRepository(DirectMsgEntity)
        private readonly directMsgsRepo: Repository<DirectMsgEntity>
    ) { }

    async createChatRoom(roomDto: ChatRoomDto): Promise<ChatRoom> {
        Logger2.log('Creating chat room with dto:')
        Logger2.log({roomDto})
        const user = await this.usersRepo.findOne({ where: { id: roomDto.ownerId } });
        Logger2.log('Found user:')
        Logger2.log({user})
        // check whether the room name is already taken
        const existingRoom = await this.chatRoomsRepo.findOne({ where: { name: roomDto.name } })
        if (existingRoom) {
            throw new Error('Room name already taken')
        }
        // create room
        const room = await this.chatRoomsRepo.save({
            name: roomDto.name,
            isPrivate: roomDto.isPrivate,
            password: roomDto.password ? bcrypt.hashSync(roomDto.password, 10) : null,
            owner: user
        })
        // add owner as member
        this.chatMembershipsRepo.save({
            user: user,
            chatRoom: room,
            isAdmin: true,
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

    async joinChatRoom(id: number, data: JoinChatRoomDto): Promise<ChatMembership> {
        
        // find if the user is already a member of the room
        const userMembership = await this.chatMembershipsRepo.find({
            where: {
                user: { id: data.userId },
                chatRoom: { id: id }
            }
        })
        if (userMembership.length > 0) {
            return this.chatMembershipsRepo.findOne({ where: { id: userMembership[0].id } })
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
        return this.chatMembershipsRepo.save({
            user: user,
            chatRoom: room,
        })
    }

    async inviteUsers(id: number, userIds: string[]) {
        userIds.forEach(element => {
            this.joinChatRoom(id, { userId: element })
        });
    }


    findChatRoomMembers(id: number): Promise<ChatMembership[]> {
        return this.chatMembershipsRepo.find({
            where: { chatRoom: { id: id } },
            relations: ['user', 'chatRoom']
        })
    }

    async findUserMemberships(userId: string): Promise<ChatMembership[]> {
        return this.chatMembershipsRepo.find({
            where: { user: { id: userId } },
            relations: ['user', 'chatRoom']
        })
    }

    async updateMembership(id: number, data: ChatMembershipDto) {
        delete data.chatRoomId
        return this.chatMembershipsRepo.update({ id: id }, data)
    }

    deleteMembership(id: number, userId: string) {
        return this.chatMembershipsRepo.delete({ chatRoom: { id: id }, user: { id: userId } })
    }

    async createChatRoomMessage(msg: ChatMsgDto): Promise<ChatMsg> {
        const sender = await this.usersRepo.findOne({ where: { id: msg.senderId } });
        Logger2.log(msg.chatRoomId)
        const room = await this.chatRoomsRepo.findOne({ where: { id: msg.chatRoomId } });
        Logger2.log({room})
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

        let outMsgs : ChatMsgDto[] = []
        for (let i = 0; i < msgs.length; i++) {
            const element = msgs[i]
            outMsgs.push ({
                senderId: element.sender.id,
                senderName: element.sender.username,
                chatRoomId: element.chatRoom.id,
                content: element.content,
                createdAt: element.createdAt
            })
        }

        return outMsgs
    }

    // Duologues -------------------------------------------------------------------------------

    async getDuologue(data: DuologueDto): Promise<Duologue> {
        var duologue = await this.findDuologue(data)
        if (!duologue) {
            const user1 = await this.usersRepo.findOne({ where: { id: data.user1Id } });
            const user2 = await this.usersRepo.findOne({ where: { id: data.user2Id } });
            duologue = await this.duologuesRepo.save({
                user1: user1,
                user2: user2
            })
        }

        return duologue
    }

    findDuologue(data: DuologueDto): Promise<Duologue> {
        var duologue = this.duologuesRepo.findOne({
            where: [
                { user1: { id: data.user1Id }, user2: { id: data.user2Id } },
                { user1: { id: data.user2Id }, user2: { id: data.user1Id } }
            ],
            relations: ['user1', 'user2']
        })

        return duologue
    }

    async createDirectMessage(id: number, dmsg: DirectMsgDto): Promise<DirectMsg> {
        const duologue = await this.duologuesRepo.findOne({ where: { id: id } });
        const user = await this.usersRepo.findOne({ where: { id: dmsg.senderId } });
        return this.directMsgsRepo.save({
            duologue: duologue,
            sender: user,
            content: dmsg.content
        })
    }
}
