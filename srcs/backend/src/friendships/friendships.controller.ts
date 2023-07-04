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

    @Post("/v2")
    @UseGuards(JwtAuthenticatedGuard)
    UpdateFriendshipV2(@Body() data: FriendshipDto, @Req() req) {
        validateInput(Joi.object({
            friendId: ID_VALIDATOR.required(),
            isBlocked: Joi.boolean(),
            isFriend: Joi.boolean(),
        }), data);

        try {

            const token = getAuthToken(req)
            if (token.userId === data.friendId)
                throw new UnauthorizedException("User and requester are the same")

            return this.friendshipsService.updateFriendship2(token.userId, data.friendId, data);
        }
        catch (error) {
            throw processError(error, "can not update friendships");
        }
    }
}
