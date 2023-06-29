import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/jwt-2fa-auth.guard';
import { BOOLEAN_VALIDATOR, CHATNAME_VALIDATOR, CHATROOM_ID_VALIDATOR, DATE_VALIDATOR, FORBIDDEN, ID_VALIDATOR, MESSAGE_VALIDATOR, PASSWORD_VALIDATOR, USERNAME_VALIDATOR, getAuthToken, isPastDate, processError, validateInput } from 'src/utils/utils';
import { ChatMembershipDto, ChatMsgDto, ChatRoomDto, JoinChatRoomDto } from './chats.dto';
import { ChatMembership, ChatRoom } from './chats.interface';
import { Chats2Service } from './chats2.service';
import * as Joi from 'joi'
import { UsersService } from 'src/users/users.service';
import { JwtAuthenticatedGuard } from 'src/auth/jwt-authenticated-guard';
import { HttpStatusCode } from 'axios';
import { JwtAdminGuard } from 'src/auth/jwt-admin-guard';
import { rootCertificates } from 'tls';
import { IS_NUMBER_STRING } from 'class-validator';

@Controller('chats')
export class Chats2Controller {
    constructor(private chatsService: Chats2Service, private usersService: UsersService) { }

    // get chat rooms
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms')
    async findAllRooms(): Promise<ChatRoom[]> {
        return await (this.chatsService.findAllChatRooms())
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/general')
    async findGeneralRoom(): Promise<ChatRoom> {
        return await (this.chatsService.findChatRoomByName("general"))
    }

    // get chat room by id (room + members)
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/:id')
    async findRoom(@Param('id') id: number): Promise<ChatRoom> {
        validateInput(Joi.object({
            id: CHATROOM_ID_VALIDATOR.required()
        }), { id })
        return await (this.chatsService.findChatRoomById(id))
    }

    // get chat room by name
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/name/:name')
    async findRoomByName(@Param('name') name: string): Promise<ChatRoom> {
        //todo: revisar si se sigue usando, de ser así revisar si se name está bien validado
        validateInput(Joi.object({
            name: CHATNAME_VALIDATOR.required()
        }), { name })
        return await (this.chatsService.findChatRoomByName(name))
    }

    // get chat rooms for user
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/user/:id')
    async findUserRooms(@Param('id') id: string): Promise<ChatRoom[]> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required()
        }), { id })
        return await (this.chatsService.findUserChatRooms(id))
    }

    // get private chat for users
    @UseGuards(JwtAuthenticatedGuard)
    @Post('rooms/direct')
    async getPrivateRoom(@Body() body: {
        user1: string,
        user2: string
    }, @Req() req): Promise<ChatRoom> {
        validateInput(Joi.object({
            user1: ID_VALIDATOR.required(),
            user2: ID_VALIDATOR.required()
        }), body)
        const token = getAuthToken(req)
        if (!token.hasRightsOverUser(token, await this.usersService.findOneById(body.user1)) &&
        !token.hasRightsOverUser(token, await this.usersService.findOneById(body.user2)))
            throw new UnauthorizedException(`Requester ${token.userId} does not have rights to retrieve private room between ${body.user1} and ${body.user2}`)
        //TODO añadir validacion de ids
        console.log("getPrivateRoom")
        Logger.log({ body })
        const id1 = body.user1
        const id2 = body.user2
        Logger.log(`id1: ${id1}, id2: ${id2}`)
        return await (this.chatsService.getDirectChatRoom(id1, id2))
    }

    // new chat room
    @UseGuards(JwtAuthenticatedGuard)
    @Post('rooms')
    async create(@Req() request, @Body() data: {
        name: string,
        password?: string
    } ): Promise<ChatRoom> {
        //todo: tambien hay un todo equivalente en frontend, revisar que pasa con el owner pasado como input que aqui no usamos y actualizar para que ponga de owner al usuario del token
        validateInput(Joi.object({
            name: CHATNAME_VALIDATOR.required(),
            password: PASSWORD_VALIDATOR
        }), data)
        try {
            const token = getAuthToken(request)
            const user = await this.usersService.findOneById(token.userId)
            const res = await this.chatsService.createChatRoom({...data, isDirect: false}, user)
            return res
        } catch (error) {
            Logger.error(error)
            throw error
        }
    }

    // update chat password
    @UseGuards(JwtAuthenticatedGuard)
    @Post('rooms/:roomId/password')
    @UseGuards(Jwt2faAuthGuard)
    async updatePassword(@Req() req: any, @Param('roomId') roomId: number, @Body() data: { password: string }) {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required(),
            password: PASSWORD_VALIDATOR.required()
        }), { ...data, roomId })
        const token = getAuthToken(req)
        return this.chatsService.updateChatRoomPassword(token.userId, roomId, data.password)
    }

    // join chat room
    @UseGuards(JwtAuthenticatedGuard) //requester tiene que ser admin or el user afectado
    @Post('rooms/:roomId/join')
    async joinRoom(@Param('roomId') roomId: number, @Body() data: JoinChatRoomDto): Promise<ChatMembership> {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required(),
            userId: ID_VALIDATOR.required(),
            password: PASSWORD_VALIDATOR
        }), { ...data, roomId });
        try {
            const res = await this.chatsService.joinChatRoom(roomId, data)
            return res
        } catch (error) {
            console.log("------")
            throw processError(error, "Failed joining room")
        }
    }

    // invite users to chat room
    @Post('rooms/:roomId/invite')
    @UseGuards(JwtAuthenticatedGuard)
    async inviteUsers(@Req() req: any, @Param('roomId') roomId: number, @Body() data: JoinChatRoomDto) {
        console.log("INVITING")
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required(),
            userId: ID_VALIDATOR.required(),
            password: FORBIDDEN
        }), { ...data, roomId })
        const token = getAuthToken(req)
        try {
            return this.chatsService.inviteUser(token.userId, roomId, data)
        } catch (error) {
            throw processError(error, `Error inviting with input ${JSON.stringify({ ...data, roomId }, null, 2)}}`)
        }
    }

    @UseGuards(JwtAdminGuard) //solo admin/owner de la web, owner del chat lo puede borrar abandonando el chat
    @Delete('rooms/:id')
    async deleteRoom(@Param('id') roomId: number) {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { roomId })
        try {
            await this.chatsService.deleteRoom(roomId)
        } catch (error) {
            if (error instanceof HttpException) throw (error)
            throw new HttpException("delete room failed", HttpStatusCode.InternalServerError);
        }
    }

    // get one memebership
    @UseGuards(JwtAuthenticatedGuard)
    @Get('memberships/:id')
    async findMembership(@Param('id') membershipId: number): Promise<ChatMembership> {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { membershipId })
        return await (this.chatsService.findChatMembershipById(membershipId))
    }

    // get chat room members
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/:id/members')
    async findRoomMembers(@Param('id') roomId: number): Promise<ChatMembership[]> {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { roomId })
        const res = await (this.chatsService.findChatRoomMembers(roomId))
        return res
    }

    // get user memberships
    @UseGuards(JwtAuthenticatedGuard)
    @Get('memberships/user/:userId')
    async findUserMemberships(@Req() req, @Param('userId') userId: string): Promise<ChatMembership[]> {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required()
        }), { userId })
        const token = getAuthToken(req)
        if (token.userId === userId && (token.role === 'ADMIN' || token.role === 'OWNER')) {
            const rooms = await this.chatsService.findAllChatRooms()

            const memberships : ChatMembership[] = rooms.map(room => {
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
        if (!token.hasRightsOverUser(token, await this.usersService.findOneById(userId)))
            throw new UnauthorizedException(`Requester ${token.userId} does not have rights to retrieve user's ${userId} memberships`)
        return await (this.chatsService.findUserMemberships(userId))
    }

    //todo: importante updatear para que vaya con id y no username porq el username se puede cambiar y da problemas
    @UseGuards(JwtAuthenticatedGuard) //todo: solo admin/owner y admin/owner de la room
    @Post('memberships/ban')
    async banUser(@Body() input: { userId: string, roomId: number }, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            roomId: Joi.number().required()
        }), input) 
        const token = getAuthToken(req)
        const user = await this.usersService.findOneById(input.userId);

        if (!user) throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

        const requesterMembership = await this.chatsService.findMembershipByUserAndRoom(token.userId, input.roomId)
        if (token.hasRightsOverUser(token, user) && 
            !requesterMembership && 
            (!requesterMembership.isAdmin || !requesterMembership.isOwner))
            this.chatsService.setIsBanned(user.id, input.roomId, true);
        else
            throw new UnauthorizedException(`Requester ${token.userId} does not have rights to ban user ${input.userId} in room ${input.roomId}`)
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('memberships/allow')
    async allowUser(@Body() input: { userName: string, roomId: number }, @Req() req) {
        //todo: implementar validateInput cuando funcione con userId en vez de userName
        const token = getAuthToken(req)
        const user = await this.usersService.findOneByName(input.userName);

        if (!user) throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

        const requesterMembership = await this.chatsService.findMembershipByUserAndRoom(token.userId, input.roomId)
        if (token.hasRightsOverUser(token, user) && !requesterMembership && (!requesterMembership.isAdmin || !requesterMembership.isOwner))
            this.chatsService.setIsBanned(user.id, input.roomId, false);
        else
            throw new UnauthorizedException(`Requester ${token.userId} does not have rights to allow user ${input.userName} in room ${input.roomId}`)
    }
    
    @UseGuards(JwtAuthenticatedGuard)
    @Post('memberships/promote')
    async promoteUser(@Body() input: { userName: string, roomId: number }, @Req() req) {
        //todo: implementar validateInput cuando funcione con userId en vez de userName
        const token = getAuthToken(req)
        const user = await this.usersService.findOneByName(input.userName);
        if (!user) 
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        
        const membership = await this.chatsService.findMembershipByUserAndRoom(user.id, input.roomId)
        if (!membership) 
            throw new HttpException("MEMBERSHIP_NOT_FOUND", HttpStatus.NOT_FOUND)

        const requesterMembership = await this.chatsService.findMembershipByUserAndRoom(token.userId, input.roomId)
        if (token.hasRightsOverUser(token, user) && !requesterMembership && (!requesterMembership.isAdmin || !requesterMembership.isOwner))
            this.chatsService.setIsAdmin(user.id, input.roomId, true);
        else
            throw new UnauthorizedException(`Requester ${token.userId} does not have rights to promote user ${input.userName} in room ${input.roomId}`)
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('memberships/demote')
    async demoteUser(@Body() input: { userName: string, roomId: number }, @Req() req) {
        //todo: implementar validateInput cuando funcione con userId en vez de userName
        const token = getAuthToken(req)
        const user = await this.usersService.findOneByName(input.userName);
        if (!user) 
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        const membership = await this.chatsService.findMembershipByUserAndRoom(user.id, input.roomId)
        if (!membership) 
            throw new HttpException("MEMBERSHIP_NOT_FOUND", HttpStatus.NOT_FOUND)

        const requesterMembership = await this.chatsService.findMembershipByUserAndRoom(token.userId, input.roomId)
        if (token.hasRightsOverUser(token, user) && !requesterMembership && (!requesterMembership.isAdmin || !requesterMembership.isOwner))
            this.chatsService.setIsAdmin(user.id, input.roomId, false);
        else
            throw new UnauthorizedException(`Requester ${token.userId} does not have rights to demote user ${input.userName} in room ${input.roomId}`)
    }

    // update membership
    @UseGuards(JwtAuthenticatedGuard)
    @Put('memberships/:id')
    async updateMembership(@Param('id') membershipId: number, @Body() data: {
        isAdmin: boolean,
        isMuted?: boolean,
        isBanned?: boolean,
        bannedUntil?: Date,
        mutedUntil?: Date
    }, @Req() req) {
        validateInput(Joi.object({
            membershipId: CHATROOM_ID_VALIDATOR.required(),
            isAdmin: BOOLEAN_VALIDATOR.required(),
            isMuted: BOOLEAN_VALIDATOR,
            isBanned: BOOLEAN_VALIDATOR,
            bannedUntil: DATE_VALIDATOR,
            mutedUntil: DATE_VALIDATOR
        }), { ...data, membershipId })
        
        const token = getAuthToken(req)

        try {
            return this.chatsService.updateMembership(membershipId, {
                isAdmin: token.role === "ADMIN",
                isOwner: token.role === "OWNER",
                userId: token.userId
            }, data)
        } catch (error) {
            if (error instanceof HttpException) throw (error)
                throw new HttpException("update membership failed", HttpStatusCode.InternalServerError);
        }
    }

    // delete membership
    @UseGuards(JwtAuthenticatedGuard)
    @Delete('memberships/:id')
    async deleteMembership(@Param('id') roomId: number, @Req() req) {
        //Ojo, admins no podrán borrar memberships, decisión de diseño
        if (roomId < 0)  // admin gets memberships for all rooms with id = -1
            return null
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { roomId })
        const token = getAuthToken(req)
        return this.chatsService.deleteMembership(roomId, token.userId)
    }

    // get chat messages for room
    @UseGuards(JwtAuthenticatedGuard)
    @Get('/messages/:roomId')
    async findRoomMessages(@Req() req, @Param('roomId') roomId: number): Promise<ChatMsgDto[]> {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { roomId })
        const token = getAuthToken(req, false)
        return await (this.chatsService.findChatRoomMessages(token, roomId))
    }

    // post chat message for room
    @UseGuards(JwtAuthenticatedGuard) // todo: revisar si hace falta un shortcut para que admisn puedan sin llegar a hacer fetch memberships en repo
    @Post('/messages/:roomId')
    async postRoomMessage(@Req() req, @Param('roomId') roomId: number, @Body() msg: {
        senderId: string,
        content: string,
        isChallenge?: boolean
    }) {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required(),
            senderId: ID_VALIDATOR.required(),
            content: MESSAGE_VALIDATOR.required(),
            isChallenge: BOOLEAN_VALIDATOR
        }), { ...msg, roomId })
        return this.chatsService.createChatRoomMessage(roomId, getAuthToken(req).userId, msg)
    }
}