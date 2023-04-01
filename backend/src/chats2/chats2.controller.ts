import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa-auth.guard';
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
        const res = await this.chatsService.getChatRoom(dto)
        return res
    }

    // update chat password
    @Post('rooms/:roomId/password')
    @UseGuards(Jwt2faAuthGuard)
    async updatePassword(@Req() req: any, @Param('roomId') roomId: number, @Body() data: any) {
        const user = req.user
        return this.chatsService.updateChatRoomPassword(user, roomId, data.password)
    }

    // join chat room
    @Post('rooms/:roomId/join')
    async joinRoom(@Param('roomId') roomId: number, @Body() data: JoinChatRoomDto): Promise<ChatMembership> {
        const res = await this.chatsService.joinChatRoom(roomId, data)
        return res
    }

    // invite users to chat room
    @Post('rooms/:roomId/invite')
    @UseGuards(Jwt2faAuthGuard)
    async inviteUsers(@Req() req: any, @Param('roomId') roomId: number, @Body() data: any) {
        const user = req.user
        return this.chatsService.inviteUser(user, roomId, data)
    }

    // leave chat room
    @Post('rooms/:id/leave')
    async leaveRoom(@Param('id') id: number, @Body() data: ChatMembershipDto) {
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
        return this.chatsService.createChatRoomMessage(msg)
    }
}