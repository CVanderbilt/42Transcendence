import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, DirectMsgDto, DuologueDto } from './chats.dto';
import { ChatMembership, ChatMsg, ChatRoom } from './chats.interface';
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
    async create(@Body() room: ChatRoomDto) : Promise<ChatRoom> {
        return this.chatsService.createChatRoom(room)
    }

    // update chat room ?

    // join chat room
    @Post('rooms/:roomId/join')
    async joinRoom(@Param('roomId') roomId: number, @Body() data: ChatMembershipDto) : Promise<ChatMembership> {
        return this.chatsService.joinChatRoom(roomId, data)
    }

    // leave chat room
    @Delete('rooms/:id/leave')
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
    async findUserMemberships(@Param('userId') userId: string) : Promise<ChatMembership[]> {
        return await (this.chatsService.findUserMemberships(userId)) 
    }

    // update membership
    @Put('memberships/:id')
    async updateMembership(@Param('id') id: number, @Body() data: ChatMembershipDto) {
        return this.chatsService.updateMembership(id, data)
    }

    // get chat messages for room
    @Get('rooms/:id/messages')
    async findRoomMessages(@Param('id') id: number): Promise<ChatMsg[]> {
        return await (this.chatsService.findChatRoomMessages(id))
    }

    // post chat message for room
    @Post('rooms/:id/messages')
    async postRoomMessage(@Param('id') id: number, @Body() msg: ChatMsgDto) {
        return this.chatsService.createChatRoomMessage(id, msg)
    }

    // Direct Messages ------------------------------------------------------------------

    // get duologue
    // finds or creates duologue
    @Post('duologues')
    async getDuologue(@Body() data: DuologueDto) {
        return await (this.chatsService.getDuologue(data))
    }
    // get duologue
    // takes two user ids and returns duologue id
    @Get('duologues')
    async findDuologue(@Body() data: DuologueDto) {
        return await (this.chatsService.findDuologue(data))
    }

    // post direct message
    @Post('duologues/:id')
    async postDirectMessage(@Param('id') duologueId: number, @Body() msg: DirectMsgDto) {
        return this.chatsService.createDirectMessage(duologueId, msg)
    }
}