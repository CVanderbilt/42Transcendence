import { Body, Controller, Delete, Get, Logger, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { getAuthToken, ID_VALIDATOR, INT_VALIDATOR, processError, validateInput } from 'src/utils/utils';
import { FriendshipDto } from './friendships.dtos';
import { FriendshipsService } from './friendships.service';
import * as Joi from 'joi'
import { JwtAuthenticatedGuard } from 'src/auth/jwt-authenticated-guard';

@Controller('friendships')
export class FriendshipsController {
    constructor(private friendshipsService: FriendshipsService) { }

    @Get("/user/:userId")
    @UseGuards(JwtAuthenticatedGuard)
    getFriendships(@Param('userId') userId: string): Promise<FriendshipDto[]> {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
        }), { userId });
        
        try {
            return this.friendshipsService.getUserFriendships(userId);
        }
        catch (error) {
            throw processError(error, "can not get friendships");
        }
    }

    @Post()
    @UseGuards(JwtAuthenticatedGuard)
    createFriendship(@Body() data: FriendshipDto, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            isBlocked: Joi.boolean(),
            isFriend: Joi.boolean(),
            friendId: ID_VALIDATOR,
        }), data);
        try {
            const token = getAuthToken(req)
            if (token.userId !== data.userId)
                throw new UnauthorizedException("Unauthorized to create friendships on behalf of other users")

            return this.friendshipsService.createFriendship(token.userId, data);
        }
        catch (error) {
            throw processError(error, "can not create friendships");
        }
    }

    @Post("/:friendshipId")
    @UseGuards(JwtAuthenticatedGuard)
    updateFriendship(@Param('friendshipId') friendshipId: string, @Body() data: FriendshipDto, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            friendshipId: INT_VALIDATOR.required(),
            isBlocked: Joi.boolean(),
            isFriend: Joi.boolean(),
        }), { ...data, friendshipId });
        try {

            console.log("updating friendship");
            const token = getAuthToken(req)
            if (token.userId !== data.userId)
                throw new UnauthorizedException("Unauthorized to update friendships on behalf of other users")

            console.log("updating friendship2");
            return this.friendshipsService.updateFriendship(friendshipId, data);
        }
        catch (error) {
            throw processError(error, "can not update friendships");
        }
    }
}
