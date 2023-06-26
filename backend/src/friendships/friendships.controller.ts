import { Body, Controller, Delete, Get, Logger, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { getAuthToken, ID_VALIDATOR, validateInput } from 'src/utils/utils';
import { FriendshipDto } from './friendships.dtos';
import { FriendshipsService } from './friendships.service';
import * as Joi from 'joi'
import { JwtAuthenticatedGuard } from 'src/auth/jwt-authenticated-guard';

@Controller('friendships')
export class FriendshipsController {
    constructor(private friendsipsService: FriendshipsService) {}

    @Get("/user/:userId")
    @UseGuards(JwtAuthenticatedGuard)
    getFriendships(@Param('userId') userId: string) : Promise<FriendshipDto[]> {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
        }), { userId });
        return this.friendsipsService.getUserFriendships(userId);
    }

    @Post()
    @UseGuards(JwtAuthenticatedGuard)
    createFriendship(@Body() data: FriendshipDto, @Req() req) {
        // validateInput(Joi.object({
        //     userId: ID_VALIDATOR.required(),
        //     // friendId: ID_VALIDATOR.required(),
        // }), data);
        const token = getAuthToken(req)
        if (token.userId === data.userId)
            throw new UnauthorizedException("Unauthorized to create friendships on behalf of other users")
        return this.friendsipsService.createFriendship(data);
    }

    @Post("/:friendshipId")
    @UseGuards(JwtAuthenticatedGuard)
    updateFriendship(@Param('friendshipId') friendshipId: string, @Body() data: FriendshipDto, @Req() req) {
        // validateInput(Joi.object({
        //     friendshipId: Joi.string.regex(/^-?\d+(\.\d+)?$/).required(),
        //     isBlocked: Joi.boolean().required()
        // }), {...data, friendshipId });
        const token = getAuthToken(req)
        if (token.userId === data.userId)
            throw new UnauthorizedException("Unauthorized to create friendships on behalf of other users")
        return this.friendsipsService.updateFriendship(friendshipId, data);
    }

    // @Delete("/:friendshipId")
    // deleteFriendship(@Param('friendshipId') friendshipId: string) { 
    //     // validateInput(Joi.object({
    //         // friendshipId: ID_VALIDATOR.required(),
    //     // }), {friendshipId });
    //     return this.friendsipsService.deleteFriendship(friendshipId);
    // }
}
