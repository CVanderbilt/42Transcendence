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

@Controller('chats')
export class Chats2Controller {
    constructor(private chatsService: Chats2Service, private usersService: UsersService) { }

    // get chat rooms
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms')
    async findAllRooms(): Promise<ChatRoom[]> {
        try {
            return await (this.chatsService.findAllChatRooms())
        } catch (error) {
            throw processError(error, "cannot find rooms");
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/general')
    async findGeneralRoom(): Promise<ChatRoom> {
        try {
            return await (this.chatsService.findChatRoomByName("general"))
        } catch (error) {
            throw processError(error, "cannot general room");
        }
    }

    // get chat room by id (room + members)
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/:id')
    async findRoom(@Param('id') id: number): Promise<ChatRoom> {
        validateInput(Joi.object({
            id: CHATROOM_ID_VALIDATOR.required()
        }), { id })
        try {
            return await (this.chatsService.findChatRoomById(id))
        } catch (error) {
            throw processError(error, "cannot find room");
        }
    }

    // get chat room by name
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/name/:name')
    async findRoomByName(@Param('name') name: string): Promise<ChatRoom> {
        validateInput(Joi.object({
            name: CHATNAME_VALIDATOR.required()
        }), { name })
        try {
            return await (this.chatsService.findChatRoomByName(name))
        } catch (error) {
            throw processError(error, "cannot find room");
        }
    }

    // get chat rooms for user
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/user/:id')
    async findUserRooms(@Param('id') id: string): Promise<ChatRoom[]> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required()
        }), { id })

        try {
            return await (this.chatsService.findUserChatRooms(id))
        } catch (error) {
            throw processError(error, "cannot find rooms for user");
        }
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

        if (body.user1 === body.user2)
            throw new HttpException("Cant create direct chat with itself", HttpStatusCode.BadRequest)
        try {
            const token = getAuthToken(req)
            if (!token.hasRightsOverUser(token, await this.usersService.findOneById(body.user1)) &&
                !token.hasRightsOverUser(token, await this.usersService.findOneById(body.user2)))
                throw new UnauthorizedException(`Requester ${token.userId} does not have rights to retrieve private room between ${body.user1} and ${body.user2}`)
            Logger.log({ body })
            const id1 = body.user1
            const id2 = body.user2
            Logger.log(`id1: ${id1}, id2: ${id2}`)
            return await (this.chatsService.getDirectChatRoom(id1, id2))
        } catch (error) {
            throw processError(error, "cannot get direc room");
        }
    }

    // new chat room
    @UseGuards(JwtAuthenticatedGuard)
    @Post('rooms')
    async create(@Req() request, @Body() data: {
        name: string,
        password?: string
    }): Promise<ChatRoom> {
        //todo: tambien hay un todo equivalente en frontend, revisar que pasa con el owner pasado como input que aqui no usamos y actualizar para que ponga de owner al usuario del token
        validateInput(Joi.object({
            name: CHATNAME_VALIDATOR.required(),
            password: PASSWORD_VALIDATOR
        }), data)
        try {
            const token = getAuthToken(request)
            const user = await this.usersService.findOneById(token.userId)
            const res = await this.chatsService.createChatRoom({ ...data, isDirect: false }, user)
            return res
        } catch (error) {
            throw processError(error, "cannot create room");
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
        try {
            const token = getAuthToken(req)
            return this.chatsService.updateChatRoomPassword(token.userId, roomId, data.password)
        } catch (error) {
            throw processError(error, "cannot update chat");
        }
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
        try {
        const token = getAuthToken(req)
            return this.chatsService.inviteUser(token.userId, roomId, data)
        } catch (error) {
            throw processError(error, `Error inviting with input ${JSON.stringify({ ...data, roomId }, null, 2)}}`)
        }
    }

    @UseGuards(JwtAdminGuard)
    @Delete('rooms/:id')
    async deleteRoom(@Param('id') roomId: number) {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { roomId })
        try {
            await this.chatsService.deleteRoom(roomId)
        } catch (error) {
            throw processError(error, 'can not delete room')
        }
    }

    // get one memebership
    @UseGuards(JwtAuthenticatedGuard)
    @Get('memberships/:id')
    async findMembership(@Param('id') membershipId: number): Promise<ChatMembership> {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { membershipId })
        try {
            return await (this.chatsService.findChatMembershipById(membershipId))
        } catch (error) {
            throw processError(error, "can not get membership");
        }
    }

    // get chat room members
    @UseGuards(JwtAuthenticatedGuard)
    @Get('rooms/:id/members')
    async findRoomMembers(@Param('id') roomId: number): Promise<ChatMembership[]> {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { roomId })
        try {
            const res = await (this.chatsService.findChatRoomMembers(roomId))
            return res
        } catch (error) {
            throw processError(error, "can not get room memberships");
        }
    }

    // get user memberships
    @UseGuards(JwtAuthenticatedGuard)
    @Get('memberships/user/:userId')
    async findUserMemberships(@Req() req, @Param('userId') userId: string): Promise<ChatMembership[]> {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required()
        }), { userId })
        try {

            const token = getAuthToken(req)
            if (token.userId === userId && (token.role === 'ADMIN' || token.role === 'OWNER')) {
                const rooms = await this.chatsService.findAllChatRooms()

                const memberships: ChatMembership[] = rooms.map(room => {
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
        } catch (error) {
            throw processError(error, "can not get room memberships");
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('memberships/ban')
    async banUser(@Body() input: { userId: string, roomId: number }, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            roomId: Joi.number().required()
        }), input)
        try {
            const token = getAuthToken(req)
            const user = await this.usersService.findOneById(input.userId);

            if (!user) throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

            const requestedMembership = await this.chatsService.findMembershipByUserAndRoom(input.userId, input.roomId)
            if (token.hasRightsOverUser(token, user) && requestedMembership) {
                this.chatsService.setIsBanned(user.id, input.roomId, true);
            }
            else
                throw new UnauthorizedException(`Requester ${token.userId} does not have rights to ban user ${input.userId} in room ${input.roomId}`)
        } catch (error) {
            throw processError(error, "can not ban user");
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('memberships/allow')
    async allowUser(@Body() input: { userId: string, roomId: number }, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            roomId: Joi.number().required()
        }), input)
        try {
            const token = getAuthToken(req)
            const user = await this.usersService.findOneById(input.userId);

            if (!user) throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

            const requestedMembership = await this.chatsService.findMembershipByUserAndRoom(input.userId, input.roomId)
            if (token.hasRightsOverUser(token, user) && requestedMembership) {
                this.chatsService.setIsBanned(user.id, input.roomId, false);
            }
            else
                throw new UnauthorizedException(`Requester ${token.userId} does not have rights to allow user ${input.userId} in room ${input.roomId}`)
        } catch (error) {
            throw processError(error, "can not allow user");
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('memberships/promote')
    async promoteUser(@Body() input: { userId: string, roomId: number }, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            roomId: Joi.number().required()
        }), input)
        try {
            const token = getAuthToken(req)
            const user = await this.usersService.findOneById(input.userId);
            if (!user)
                throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

            const membership = await this.chatsService.findMembershipByUserAndRoom(user.id, input.roomId)
            if (!membership)
                throw new HttpException("MEMBERSHIP_NOT_FOUND", HttpStatus.NOT_FOUND)

            const requestedMembership = await this.chatsService.findMembershipByUserAndRoom(input.userId, input.roomId)
            if (token.hasRightsOverUser(token, user) && requestedMembership) {
                this.chatsService.setIsAdmin(user.id, input.roomId, true);
            }
            else
                throw new UnauthorizedException(`Requester ${token.userId} does not have rights to promote user ${input.userId} in room ${input.roomId}`)
        } catch (error) {
            throw processError(error, "can not promote user");
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('memberships/demote')
    async demoteUser(@Body() input: { userId: string, roomId: number }, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            roomId: Joi.number().required()
        }), input)
        try {
            const token = getAuthToken(req)
            const user = await this.usersService.findOneById(input.userId);
            if (!user)
                throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)

            const membership = await this.chatsService.findMembershipByUserAndRoom(user.id, input.roomId)
            if (!membership)
                throw new HttpException("MEMBERSHIP_NOT_FOUND", HttpStatus.NOT_FOUND)

            const requestedMembership = await this.chatsService.findMembershipByUserAndRoom(input.userId, input.roomId)
            if (token.hasRightsOverUser(token, user) && requestedMembership) {
                this.chatsService.setIsAdmin(user.id, input.roomId, false);
            }
            else
                throw new UnauthorizedException(`Requester ${token.userId} does not have rights to demote user ${input.userId} in room ${input.roomId}`)
        } catch (error) {
            throw processError(error, "can not promote user");
        }
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

        try {
            const token = getAuthToken(req)
            return this.chatsService.updateMembership(membershipId, {
                isAdmin: token.role === "ADMIN",
                isOwner: token.role === "OWNER",
                userId: token.userId
            }, data)
        } catch (error) {
            throw processError(error, "update membership failed")
        }
    }

    // delete membership
    @UseGuards(JwtAuthenticatedGuard)
    @Delete('memberships/:id')
    async deleteMembership(@Param('id') roomId: number, @Req() req) {
        // Admins should not be able to delete memberships
        try {
            if (roomId < 0)  // admin gets memberships for all rooms with id = -1
                return null
            validateInput(Joi.object({
                roomId: CHATROOM_ID_VALIDATOR.required()
            }), { roomId })
            const token = getAuthToken(req)
            return this.chatsService.deleteMembership(roomId, token.userId)
        } catch (error) {
            throw processError(error, "deleteMembership failed")
        }
    }

    // get chat messages for room
    @UseGuards(JwtAuthenticatedGuard)
    @Get('/messages/:roomId')
    async findRoomMessages(@Req() req, @Param('roomId') roomId: number): Promise<ChatMsgDto[]> {
        validateInput(Joi.object({
            roomId: CHATROOM_ID_VALIDATOR.required()
        }), { roomId })
        try {
            const token = getAuthToken(req, false)
            return await (this.chatsService.findChatRoomMessages(token, roomId))
        }
        catch (error) {
            processError(error, "could not retrieve messages");
        }
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
        try {
            return this.chatsService.createChatRoomMessage(roomId, getAuthToken(req).userId, msg)
        }
        catch (error) {
            processError(error, "could not post message");
        }
    }
}