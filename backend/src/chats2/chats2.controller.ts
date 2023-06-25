import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa-auth.guard';
import { getAuthToken, validateInput } from 'src/utils/utils';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, JoinChatRoomDto } from './chats.dto';
import { ChatMembership, ChatRoom } from './chats.interface';
import { Chats2Service } from './chats2.service';
import * as Joi from 'joi'
import { UsersService } from 'src/users/users.service';

@Controller('chats')
export class Chats2Controller {
    constructor(private chatsService: Chats2Service, private usersService: UsersService) { }

    // get chat rooms
    @Get('rooms')
    async findAllRooms(): Promise<ChatRoom[]> {
        return await (this.chatsService.findAllChatRooms())
    }

    @Get('rooms/general')
    async findGeneralRoom(): Promise<ChatRoom> {
        return await (this.chatsService.findChatRoomByName("general"))
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

    // get private chat for users
    @Post('rooms/direct')
    async getPrivateRoom(@Body() body: any): Promise<ChatRoom> {
        Logger.log("getPrivateRoom")
        //TODO validar que los ids sean validos
        Logger.log(`body: ${body}`)
        const id1 = body.user1
        const id2 = body.user2
        Logger.log(`id1: ${id1}, id2: ${id2}`)
        return await (this.chatsService.getDirectChatRoom(id1, id2))
    }

    // new chat room
    @Post('rooms')
    async create(@Req() request, @Body() dto: ChatRoomDto): Promise<ChatRoom> {
        // validateInput(Joi.object({
        //     password: Joi.string().required(), // Eliminar is required porque puede haber salas sin password
        //     name: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(), // todo: revisar a lo mejor no funciona correctamente
        //     isPrivate: Joi.boolean, // todo: revisar a lo mejor no funciona correctamente
        //     isDirect: Joi.boolean // todo: revisar a lo mejor no funciona correctamente
        // }), dto); // TODO: no permitir caracteres raros
        try {
            const token = getAuthToken(request)
            const user = await this.usersService.findOneById(token.userId)
            const res = await this.chatsService.createChatRoom(dto, user)
            return res
        } catch (error) {
            Logger.error(error)
            throw error
        }
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
        // validateInput(Joi.object({
        //     userId: Joi.string().guid().required(),
        //     password: Joi.string().required()
        // }), data);
        try {
            const res = await this.chatsService.joinChatRoom(roomId, data)
            return res
        } catch (error) {
            Logger.error(error)
        }
    }

    // invite users to chat room
    @Post('rooms/:roomId/invite')
    @UseGuards(Jwt2faAuthGuard)
    async inviteUsers(@Req() req: any, @Param('roomId') roomId: number, @Body() data: any) {
        // validateInput(Joi.object({
        //     userId: Joi.string().guid().required(),
        //     password: Joi.string().required() // eliminar required porque puede haber salas sin password
        // }), data);
        const user = req.user
        return this.chatsService.inviteUser(user, roomId, data)
    }

    @Delete('rooms/:id')
    async deleteRoom(@Param('id') id: number) {
        this.chatsService.deleteRoom(id)
    }77

    // leave chat room
    @Post('rooms/:id/leave')
    async leaveRoom(@Param('id') id: number, @Body() data: ChatMembershipDto) {
        validateInput(Joi.object({
            userId: Joi.string().guid().required(),
        }), data);
        return this.chatsService.leaveRoom(id, data.userId)
    }

    // get one memebership
    @Get('memberships/:id')
    async findMembership(@Param('id') id: number): Promise<ChatMembership> {
        return await (this.chatsService.findChatMembershipById(id))
    }


    // get chat room members
    @Get('rooms/:id/members')
    async findRoomMembers(@Param('id') id: number): Promise<ChatMembership[]> {
        const res = await (this.chatsService.findChatRoomMembers(id))
        return res
    }

    // get user memberships
    @Get('memberships/user/:userId')
    async findUserMemberships(@Req() req, @Param('userId') userId: string): Promise<ChatMembership[]> {
        const token = getAuthToken(req)
        if (token.role === 'ADMIN' || token.role === 'OWNER') {
            const rooms = await this.chatsService.findAllChatRooms()

            const memberships : ChatMembership[] = rooms .map(room => {
                return {
                    id: -1,
                    isOwner: true,
                    isAdmin: true,
                    isBanned: false,
                    isMuted: false,
                    bannedUntil: new Date(),
                    mutedUntil: new Date(),
                    chatRoom: room,
                }
            })

            return memberships
        }

        return await (this.chatsService.findUserMemberships(userId))
    }

    @Post('memberships/ban')
    async banUser(@Body() input: { userName: string, roomId: number }) {
        const user = await this.usersService.findOneByName(input.userName);

        if (!user) throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

        this.chatsService.setIsBanned(user.id, input.roomId, true);
    }

    @Post('memberships/allow')
    async allowUser(@Body() input: { userName: string, roomId: number }) {
        const user = await this.usersService.findOneByName(input.userName);

        if (!user) throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

        this.chatsService.setIsBanned(user.id, input.roomId, false);
    }
    
    @Post('memberships/promote')
    async promoteUser(@Body() input: { userName: string, roomId: number }) {
        const user = await this.usersService.findOneByName(input.userName);
        if (!user) 
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        const membership = await this.chatsService.findMembershipByUserAndRoom(user.id, input.roomId)
        if (!membership) 
            throw new HttpException("MEMBERSHIP_NOT_FOUND", HttpStatus.NOT_FOUND)

        this.chatsService.setIsAdmin(user.id, input.roomId, true);
    }

    @Post('memberships/demote')
    async demoteUser(@Body() input: { userName: string, roomId: number }) {
        const user = await this.usersService.findOneByName(input.userName);
        if (!user) 
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        const membership = await this.chatsService.findMembershipByUserAndRoom(user.id, input.roomId)
        if (!membership) 
            throw new HttpException("MEMBERSHIP_NOT_FOUND", HttpStatus.NOT_FOUND)

        this.chatsService.setIsAdmin(user.id, input.roomId, false);
    }

    // update membership
    @Put('memberships/:id')
    async updateMembership(@Param('id') id: number, @Body() data: ChatMembershipDto) {
        // validateInput(Joi.object({
        //     userId: Joi.string().guid().required(),
        //     isOwner: Joi.boolean(),
        //     isAdmin: Joi.boolean(),
        //     isBanend: Joi.boolean(),
        //     isMuted: Joi.boolean()
        // }), data);
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
    async findRoomMessages(@Req() req, @Param('roomId') roomId: number): Promise<ChatMsgDto[]> {
        const token = getAuthToken(req, false)
        return await (this.chatsService.findChatRoomMessages(token, roomId))
    }

    // post chat message for room
    @Post('/messages/:roomId')
    async postRoomMessage(@Req() req, @Param('roomId') roomId: number, @Body() msg: ChatMsgDto) {
        validateInput(Joi.object({
            senderId: Joi.string().guid().required(),
            chatRoomId: Joi.number().required(),
            content: Joi.string().regex(/^[a-zA-Z0-9\s-_]+$/).required(),
            // senderName: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            createdAt: Joi.string().isoDate(), // todo: revisar a lo mejor no funciona correctamente
            isChallenge: Joi.boolean(),
        }), msg);

        return this.chatsService.createChatRoomMessage(getAuthToken(req, false), msg)
    }
}