import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoomEntity, ChatMembershipEntity, ChatMsgEntity, DirectMsgEntity, DuologueEntity } from './chatEntities.entity';
import { ChatRoom, ChatMembership, ChatMsg, Duologue, DirectMsg } from './chats.interface';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/users/user.entity';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, DirectMsgDto, DuologueDto } from './chats.dto';

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

    async createChatRoom(room: ChatRoomDto): Promise<ChatRoom> {
        const user = await this.usersRepo.findOne({ where: { userId: room.ownerId } });
        return this.chatRoomsRepo.save({
            name: room.name,
            isPrivate: room.isPrivate,
            password: room.password ? bcrypt.hashSync(room.password, 10) : null,
            owner: user
        })
    }

    findAllChatRooms(): Promise<ChatRoom[]> {
        return this.chatRoomsRepo.find();
    }

    findChatRoomById(id: number): Promise<ChatRoom> {
        return this.chatRoomsRepo.findOne({ where: { id: id } })
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

    async joinChatRoom(id: number, data: ChatMembershipDto): Promise<ChatMembership> {
        const user = await this.usersRepo.findOne({ where: { userId: data.userId } });
        const room = await this.chatRoomsRepo.findOne({ where: { id: id } });

        //if there is no other membership for this room set isAdmin to true
        const memberships = await this.chatMembershipsRepo.find({ where: { chatRoom: { id: id } } })
        if (memberships.length == 0) {
            data.isAdmin = true
        }

        return this.chatMembershipsRepo.save({
            user: user,
            chatRoom: room,
            isAdmin: data.isAdmin,
            isBanned: data.isBanned,
            bannedUntil: data.bannedUntil,
            isMuted: data.isMuted,
            mutedUntil: data.mutedUntil
        })
    }

    findChatRoomMembers(id: number): Promise<ChatMembership[]> {
        return this.chatMembershipsRepo.find({
            where: { chatRoom: { id: id } },
            relations: ['user', 'chatRoom']
        })
    }

    async findUserMemberships(userId: string): Promise<ChatMembership[]> {
        return this.chatMembershipsRepo.find({
            where: { user: { userId: userId } },
            relations: ['user', 'chatRoom']
        })
    }

    async updateMembership(id: number, data: ChatMembershipDto) {
        const membership = await this.chatMembershipsRepo.findOne({ where: { id: id } });        
        membership.bannedUntil = data.bannedUntil
        membership.isBanned = data.isBanned
        membership.isAdmin = data.isAdmin
        membership.isMuted = data.isMuted
        membership.mutedUntil = data.mutedUntil
        return await this.chatMembershipsRepo.save(membership)        
    }

    deleteMembership(id: number, userId: string) {
        return this.chatMembershipsRepo.delete({ chatRoom: { id: id }, user: { userId: userId } })
    }

    async createChatRoomMessage(id: number, msg: ChatMsgDto): Promise<ChatMsg> {
        const user = await this.usersRepo.findOne({ where: { userId: msg.senderId } });
        const room = await this.chatRoomsRepo.findOne({ where: { id: id } });
        return this.chatMsgsRepo.save({
            user: user,
            chatRoom: room,
            content: msg.content
        })
    }

    findChatRoomMessages(id: number): Promise<ChatMsg[]> {
        return this.chatMsgsRepo.find({
            where: { chatRoom: { id: id } },
            relations: ['user']
        })
    }

    // Duologues -------------------------------------------------------------------------------

    async createDuologue(data: DuologueDto) : Promise<Duologue> {
        var duologue = await this.findDuologue(data)
        if (!duologue) {
            const user1 = await this.usersRepo.findOne({ where: { userId: data.user1Id } });
            const user2 = await this.usersRepo.findOne({ where: { userId: data.user2Id } });
            duologue = await this.duologuesRepo.save({
                user1: user1,
                user2: user2
            })
        }

        return duologue
    }

    findDuologue(data: DuologueDto) : Promise<Duologue> {
        var duologue = this.duologuesRepo.findOne({
            where: [
                { user1: { userId: data.user1Id }, user2: { userId: data.user2Id } },
                { user1: { userId: data.user2Id }, user2: { userId: data.user1Id } }
            ],
            relations: ['user1', 'user2']
        })

        return duologue
    }

    async createDirectMessage(id: number, dmsg: DirectMsgDto) : Promise<DirectMsg> {
        const duologue = await this.duologuesRepo.findOne({ where: { id: id } });
        const user = await this.usersRepo.findOne({ where: { userId: dmsg.senderId } });
        Logger.log({user})
        return this.directMsgsRepo.save({
            duologue: duologue,
            sender: user,
            content: dmsg.content
        })
    }
}
