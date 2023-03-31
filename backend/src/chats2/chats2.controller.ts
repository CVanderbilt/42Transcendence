import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { validateInput } from 'src/utils/utils';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, JoinChatRoomDto } from './chats.dto';
import { ChatMembership, ChatRoom } from './chats.interface';
import { Chats2Service } from './chats2.service';
import * as Joi from 'joi'

@Controller('chats')
export class Chats2Controller {
    constructor(private chatsService: Chats2Service) { }

    // get chat rooms
    @Get('rooms')
    async findAllRooms(): Promise<ChatRoom[]> {
        return await (this.chatsService.findAllChatRooms())
    }

    // get chat room by id (room + members)
    @Get('rooms/:id')
    async findRoom(@Param('id') id: number): Promise<ChatRoom> {
        return await (this.chatsService.findChatRoomById(id))
    }

    // get chat room by name
    @Get('rooms/name/:name')
    async findRoomByName(@Param('name') name: string): Promise<ChatRoom> {
        return await (this.chatsService.findChatRoomByName(name))
    }

    // get chat rooms for user
    @Get('rooms/user/:id')
    async findUserRooms(@Param('id') id: string): Promise<ChatRoom[]> {
        return await (this.chatsService.findUserChatRooms(id))
    }

    // new chat room
    @Post('rooms')
    async create(@Body() dto: ChatRoomDto): Promise<ChatRoom> {
        validateInput(Joi.object({
            password: Joi.string().required(),
            name: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            isPrivate: Joi.boolean,
            isDirect: Joi.boolean
        }), dto);
        try {
            const res = await this.chatsService.getChatRoom(dto)
            return res
        } catch (error) {
            Logger.error(error)
        }
    }

    // update chat password
    @Post('rooms/:roomId/password')  
    async updatePassword(@Param('roomId') roomId: number, @Body() data: any) {
        return this.chatsService.updateChatRoomPassword(roomId, data.password)
    }

    // join chat room
    @Post('rooms/:roomId/join')
    async joinRoom(@Param('roomId') roomId: number, @Body() data: JoinChatRoomDto): Promise<ChatMembership> {
        validateInput(Joi.object({
            userId: Joi.string().guid().required(),
            password: Joi.string()
        }), data);
        try {
            const res = await this.chatsService.joinChatRoom(roomId, data)
            return res
        } catch (error) {
            Logger.error(error)
        }
    }

    // invite users to chat room
    @Post('rooms/:roomId/invite')
    async inviteUsers(@Param('roomId') roomId: number, @Body() data: any) {
        return this.chatsService.inviteUser(roomId, data)
    }

    // leave chat room
    @Post('rooms/:id/leave')
    async leaveRoom(@Param('id') id: number, @Body() data: ChatMembershipDto) {
        validateInput(Joi.object({
            userId: Joi.string().guid().required(),
        }), data);
        return this.chatsService.leaveRoom(id, data.userId)
    }

    // get chat room members
    @Get('rooms/:id/members')
    async findRoomMembers(@Param('id') id: number): Promise<ChatMembership[]> {
        return await (this.chatsService.findChatRoomMembers(id))
    }

    // get user memberships
    @Get('memberships/user/:userId')
    async findUserMemberships(@Param('userId') userId: string): Promise<ChatMembership[]> {
        return await (this.chatsService.findUserMemberships(userId))
    }

    // update membership
    @Put('memberships/:id')
    async updateMembership(@Param('id') id: number, @Body() data: ChatMembershipDto) {
        validateInput(Joi.object({
            userId: Joi.string().guid().required(),
            isOwner: Joi.boolean(),
            isAdmin: Joi.boolean(),
            isBanend: Joi.boolean(),
            isMuted: Joi.boolean()
        }), data);
        return this.chatsService.updateMembership(id, data)
    }

    // delete membership
    @Delete('memberships/:id')
    async deleteMembership(@Param('id') id: number) {
        Logger.log(`delete membership ${id}`)
        return this.chatsService.deleteMembership(id)
    }

    // get chat messages for room
    @Get('/messages/:roomId')
    async findRoomMessages(@Param('roomId') roomId: number): Promise<ChatMsgDto[]> {
        return await (this.chatsService.findChatRoomMessages(roomId))
    }

    // post chat message for room
    @Post('/messages/:roomId')
    async postRoomMessage(@Param('roomId') roomId: number, @Body() msg: ChatMsgDto) {
        validateInput(Joi.object({
            senderId: Joi.string().guid().required(),
            chatRoomId: Joi.number().required(),
            content: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            senderName: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            createdAt: Joi.string().isoDate(), // todo: revisar a lo mejor no funciona correctamente
        }), msg);
        return this.chatsService.createChatRoomMessage(msg)
    }
}