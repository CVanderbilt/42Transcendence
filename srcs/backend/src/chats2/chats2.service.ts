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
import { isPastDate, processError } from 'src/utils/utils';
import { HttpStatusCode } from 'axios';
import { Namespace } from 'socket.io';
import e from 'express';

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

    async createChatRoom(roomDto: ChatRoomDto, user: User = null, withOwner: boolean = true): Promise<ChatRoom> {
        // check whether the room name is already taken
        const existingRoom = await this.chatRoomsRepo.findOne({ where: { name: roomDto.name } })
        if (existingRoom) {
            throw new HttpException('Room name already taken', 409)
        }

        const isPrivate = roomDto.password && !roomDto.isDirect ? true : false
        // create room
        const room = await this.chatRoomsRepo.save({
            name: roomDto.name,
            isPrivate,
            password: roomDto.password ? bcrypt.hashSync(roomDto.password, 10) : null,
            isDirect: roomDto.isDirect
        })

        // if a user is provided add it as owner to the room
        if (user != null) {
            await this.chatMembershipsRepo.save({
                user: { id: user.id },
                chatRoom: { id: room.id },
                isOwner: withOwner,
            })
        }

        return room
    }

    async updateChatRoomPassword(userId: string, roomId: number, password: string) {
        // check user belongs to the room and is owner
        const userMembership = await this.chatMembershipsRepo.find({
            where: {
                user: { id: userId },
                chatRoom: { id: roomId },
                isOwner: true,
            }
        })

        if (userMembership.length == 0) {
            throw new UnauthorizedException(`User ${userId} is not allowed to update room ${roomId} password`)
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
        // find the chat room with the two users that is direct
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
        const roomName = names[0] + "-" + names[1]
        // if no room is found create one
        const roomDto: ChatRoomDto = {
            name: roomName,
            password: "",
            isDirect: true,
        }
        const roomCreated = await this.createChatRoom(roomDto, null, false)
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
                isDirect: false
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

    async joinChatRoom(roomId: number, data: JoinChatRoomDto, override?: boolean): Promise<ChatMembership> {
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

        if (userMembership && userMembership.length > 0) {
            const m = await this.chatMembershipsRepo.findOne(
                {
                    where: { id: userMembership[0].id },
                    relations: ['user', 'chatRoom'],
                })
            m.isPresent = true;
            m.save()
            return m
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
        if (room.isPrivate && !override) {
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

        const res = this.chatMembershipsRepo.findOne({
            where: { id: membership.id },
            relations: ['user', 'chatRoom'],
        })
        return res
    }

    async inviteUser(inviterId: string, id: number, data: JoinChatRoomDto) {
        // check user belongs to the room and is not banned
        const userMembership = await this.chatMembershipsRepo.find({
            where: {
                user: { id: inviterId },
                chatRoom: { id: id },
                isBanned: false,
            }
        })

        const user = await this.usersRepo.findOne({ where: { id: inviterId } })
        if (user.role != "ADMIN" && user.role != "OWNER") {
            if (userMembership.length == 0)
                throw new UnauthorizedException('You are not a member of this room')
        }

        this.joinChatRoom(id, data, true)
    }


    async findChatMembershipById(membershipId: number): Promise<ChatMembershipEntity> {
        const res = await this.chatMembershipsRepo.findOne({
            where: { id: membershipId },
            relations: ['user', 'chatRoom'],
        })
        if (!res) {
            throw new NotFoundException('Membership not found')
        }
        return res
    }

    async findMembershipOwner(membershipId: number): Promise<User> {
        const res = await this.chatMembershipsRepo.findOne({
            where: { id: membershipId },
            relations: ['user', 'chatRoom'],
        })
        if (!res) {
            throw new NotFoundException('Membership not found')
        }
        return res.user
    }

    async findChatRoomMembers(id: number): Promise<ChatMembership[]> {
        const res = await this.chatMembershipsRepo.find({
            where: { chatRoom: { id: id } },
            relations: ['user', 'chatRoom']
        })

        // update isBanned and isMutted fields for each member depending on the date

        res.forEach(membership => {
            if (isPastDate(membership.bannedUntil)) {
                membership.isBanned = false
                this.chatMembershipsRepo.save(membership)
            }
            if (isPastDate(membership.mutedUntil)) {
                membership.isMuted = false
                this.chatMembershipsRepo.save(membership)
            }
        })

        return res
    }

    async findMembershipByUserAndRoom(userId: string, roomId: number): Promise<ChatMembership> {
        const res = await this.chatMembershipsRepo.findOne({
            where: {
                user: { id: userId },
                chatRoom: { id: roomId }
            },
            relations: ['user', 'chatRoom'],
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
            memberships.forEach(async membership => {
                if (isPastDate(membership.bannedUntil)) {
                    membership.isBanned = false
                    this.chatMembershipsRepo.save(membership)
                }
                if (isPastDate(membership.mutedUntil)) {
                    membership.isMuted = false
                    this.chatMembershipsRepo.save(membership)
                }

                //update roomName if it is a direct room
                if (membership.chatRoom.isDirect) {
                    const roomMemberships = await this.findChatRoomMembers(membership.chatRoom.id) as any[]
                    const otherMember = roomMemberships.find(m => m.user.id !== userId)
                    if (otherMember) {
                        const names = [membership.user.username, otherMember.user.username]
                        names.sort()
                        membership.chatRoom.name = names.join(' - ')
                        membership.chatRoom.save()
                        this.chatRoomsRepo.save(membership.chatRoom)
                    }
                }
            })
        })

        return res
    }

    async updateMembership(membershipId: number, requester: {
        userId: string,
        isAdmin: boolean,
        isOwner: boolean
    }, data: {
        isAdmin: boolean,
        isMuted?: boolean,
        isBanned?: boolean,
        bannedUntil?: Date,
        mutedUntil?: Date
    }) {
        const membership = await this.findChatMembershipById(membershipId)
        if (!membership) {
            throw new HttpException("No membership found with id " + membershipId, HttpStatusCode.NotFound)
        }
        if (membership.isOwner) {
            throw new HttpException("Cant change owner memberhips", HttpStatusCode.BadRequest)
        }
        const requesterMembership = await this.getUserChatMembership(requester.userId, membership.chatRoom.id)
        if (requester.isAdmin || requester.isOwner ||
            ((requesterMembership.isAdmin || requesterMembership.isOwner) && isPastDate(requesterMembership.bannedUntil))) {
            if (!data.isBanned)
                data.bannedUntil = new Date()
            if (!data.isMuted)
                data.mutedUntil = new Date()

            membership.isBanned = data.isBanned
            membership.isAdmin = data.isAdmin
            membership.isMuted = data.isMuted
            membership.bannedUntil = data.bannedUntil
            membership.mutedUntil = data.mutedUntil
            membership.save()
            return membership
        }
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
        try {
            const membership = await this.getUserChatMembership(userId, chatRoomId)

            membership.isBanned = isBanned;
            membership.bannedUntil = isBanned ? new Date(3000, 0, 1) : new Date()
            membership.save();
        }
        catch (e) {
            return new HttpException('User is not a member of this room', HttpStatusCode.BadRequest)
        }
    }

    async setIsAdmin(userId: string, chatRoomId: number, isAdmin: boolean) {
        try {
            const membership = await this.getUserChatMembership(userId, chatRoomId)

            membership.isAdmin = isAdmin;
            membership.save();
        }
        catch (e) {
            return new HttpException('User is not a member of this room', HttpStatusCode.BadRequest)
        }
    }

    async deleteMembership(mshpId: number, requesterId: string, override: boolean = false) {
        try {
            let deleteRoom = false;
            const membership = await this.chatMembershipsRepo.findOne({ where: { id: mshpId }, relations: ['chatRoom', 'user'] })
            console.log(membership)
            const memberships = await this.findChatRoomMembers(membership.chatRoom.id)
            const room = membership.chatRoom

            if (!membership)
                return new HttpException('Membership not found', HttpStatusCode.NotFound)
            const requesterMembership = await this.findMembershipByUserAndRoom(requesterId, membership.chatRoom.id)
            const requesterHasNotRightsErr = new HttpException("Requester doesnt have rights to delete membership", HttpStatusCode.Unauthorized)

            if (!override) {
                if (!requesterMembership.isOwner && !requesterMembership.isAdmin && membership.user.id != requesterId) {
                    throw requesterHasNotRightsErr
                }
            }

            // if the user is the owner of the room, assign the ownership to another member
            if (membership.isOwner) {
                const newOwner = memberships.find(m => m.id !== membership.id)
                if (newOwner) {
                    const entity = await this.chatMembershipsRepo.findOne({ where: { id: newOwner.id } })
                    entity.isOwner = true
                    await entity.save()
                }
            }
            // if the user is the last member of the room, delete the room
            if (memberships.filter(m => m.isPresent).length <= 1)
                deleteRoom = true;
            // if it was a direct room, delete the room
            if (membership.chatRoom.isDirect)
                deleteRoom = true;

            // await this.chatMembershipsRepo.delete({ id: mshpId })
            membership.isPresent = false
            await membership.save()

            if (deleteRoom) {
                const membershipsIds = memberships.map(m => m.id)
                await this.chatMembershipsRepo.delete(membershipsIds)
                await this.chatRoomsRepo.delete(room.id)
            }
        }
        catch (e) {
            throw processError(e, "Error deleting membership")
        }
    }

    async deleteRoom(chatRoomId: number) {
        await this.chatMembershipsRepo.delete({ chatRoom: { id: chatRoomId } })
        await this.chatMsgsRepo.delete({ chatRoom: { id: chatRoomId } })
        this.chatRoomsRepo.delete(chatRoomId);
    }


    //-------------------------------------------- messages

    async createChatRoomMessage(chatRoomId: number, senderId: string, msg: {
        senderId: string,
        content: string,
        isChallenge?: boolean
    }, override: boolean = false): Promise<ChatMsg> {
        const sender = await this.usersRepo.findOne({ where: { id: senderId } });
        const room = await this.chatRoomsRepo.findOne({ where: { id: chatRoomId } });

        const membership = await this.chatMembershipsRepo.findOne({
            where: {
                user: { id: senderId },
                chatRoom: { id: chatRoomId },
            }
        })

        if (!override) {
            if (!membership || !isPastDate(membership.bannedUntil))
                throw new HttpException('You are not allowed to post messages in this room', HttpStatusCode.Unauthorized)
            if (!isPastDate(membership.mutedUntil))
                throw new HttpException('You are muted in this room', HttpStatusCode.Unauthorized)
        }

        const postedMsg = await this.chatMsgsRepo.save({
            sender: sender,
            chatRoom: room,
            content: msg.content,
            isChallenge: msg.isChallenge,
        })

        return postedMsg
    }

    async findChatRoomMessages(token: any, roomId: number): Promise<ChatMsgDto[]> {
        const msgs = await this.chatMsgsRepo.find({
            where: { chatRoom: { id: roomId } },
            relations: ['sender', 'chatRoom'],
            order: { createdAt: 'ASC' }
        })

        let outMsgs: ChatMsgDto[] = []
        for (let i = 0; i < msgs.length; i++) {
            const element = msgs[i]
            outMsgs.push({
                senderId: element.sender.id,
                senderName: element.sender.username,
                chatRoomId: element.chatRoom.id,
                content: element.content,
                createdAt: element.createdAt,
                isChallenge: element.isChallenge,
            })
        }

        if (token.role === 'ADMIN' || token.role === 'OWNER')
            return outMsgs

        const membership = await this.getUserChatMembership(token.userId, roomId)
        if (!membership)
            throw new HttpException('You are not a member of this room', HttpStatusCode.Unauthorized)

        if (!isPastDate(membership.bannedUntil))
            throw new HttpException('You have been banned from this room', HttpStatusCode.Unauthorized)

        return outMsgs
    }


}
