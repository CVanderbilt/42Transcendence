import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, JoinChatRoomDto } from './chats.dto';
import { ChatMembership, ChatRoom } from './chats.interface';
import { Chats2Service } from './chats2.service';

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
        try {
            const res = await this.chatsService.getChatRoom(dto)
            return res
        } catch (error) {
            Logger.error(error)
        }
    }

    // join chat room
    @Post('rooms/:roomId/join')
    async joinRoom(@Param('roomId') roomId: number, @Body() data: JoinChatRoomDto): Promise<ChatMembership> {
        try {
            const res = await this.chatsService.joinChatRoom(roomId, data)
            return res
        }
        catch (error) {
            Logger.error(error)
        }
    }

    // invite users to chat room
    @Post('rooms/:roomId/invite')
    async inviteUsers(@Param('roomId') roomId: number, @Body() data: any) {
        return this.chatsService.inviteUser(roomId, data.userId)
    }

    // leave chat room
    @Post('rooms/:id/leave')
    async leaveRoom(@Param('id') id: number, @Body() data: ChatMembershipDto) {
        return this.chatsService.deleteMembership(id, data.userId)
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
        return this.chatsService.updateMembership(id, data)
    }

    // get chat messages for room
    @Get('/messages/:roomId')
    async findRoomMessages(@Param('roomId') roomId: number): Promise<ChatMsgDto[]> {
        return await (this.chatsService.findChatRoomMessages(roomId))
    }

    // post chat message for room
    @Post('/messages/:roomId')
    async postRoomMessage(@Param('roomId') roomId: number, @Body() msg: ChatMsgDto) {
        return this.chatsService.createChatRoomMessage(msg)
    }
}