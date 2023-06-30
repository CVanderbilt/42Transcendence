import { Body, Controller, Delete, Get, Logger, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { getAuthToken, ID_VALIDATOR, processError, validateInput } from 'src/utils/utils';
import { FriendshipDto } from './friendships.dtos';
import { FriendshipsService } from './friendships.service';
import * as Joi from 'joi'
import { JwtAuthenticatedGuard } from 'src/auth/jwt-authenticated-guard';

@Controller('friendships')
export class FriendshipsController {
    constructor(private friendsipsService: FriendshipsService) { }

    @Get("/user/:userId")
    @UseGuards(JwtAuthenticatedGuard)
    getFriendships(@Param('userId') userId: string): Promise<FriendshipDto[]> {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
        }), { userId });
        try {
            return this.friendsipsService.getUserFriendships(userId);
        }
        catch (error) {
            processError(error, "can not get friendships");
        }
    }

    @Post()
    @UseGuards(JwtAuthenticatedGuard)
    createFriendship(@Body() data: FriendshipDto, @Req() req) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            friendId: ID_VALIDATOR.required(),
            isBlocked: Joi.boolean(),
            isFriend: Joi.boolean(),
        }), data);
        try {
            const token = getAuthToken(req)
            if (token.userId !== data.userId)
                throw new UnauthorizedException("Unauthorized to create friendships on behalf of other users")
            return this.friendsipsService.createFriendship(data);
        }
        catch (error) {
            processError(error, "can not get friendships");
        }
    }

    @Post("/:friendshipId")
    @UseGuards(JwtAuthenticatedGuard)
    updateFriendship(@Param('friendshipId') friendshipId: string, @Body() data: FriendshipDto, @Req() req) {
        validateInput(Joi.object({
            friendshipId: Joi.string().regex(/^\d+$/).required(),
            userId: ID_VALIDATOR.required(),
            friendId: ID_VALIDATOR.required(),
            isBlocked: Joi.boolean(),
            isFriend: Joi.boolean(),
        }), {...data, friendshipId });
        const token = getAuthToken(req)
        if (token.userId === data.userId)
            throw new UnauthorizedException("Unauthorized to update friendships on behalf of other users")
        return this.friendsipsService.updateFriendship(friendshipId, data);
    }
}
