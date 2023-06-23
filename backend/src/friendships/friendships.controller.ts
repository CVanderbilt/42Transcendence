import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { ID_VALIDATOR, validateInput } from 'src/utils/utils';
import { FriendshipDto } from './friendships.dtos';
import { FriendshipsService } from './friendships.service';
import * as Joi from 'joi'

@Controller('friendships')
export class FriendshipsController {
    constructor(private friendsipsService: FriendshipsService) {}

    @Get("/user/:userId")
    getFriendships(@Param('userId') userId: string) : Promise<FriendshipDto[]> {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
        }), { userId });
        return this.friendsipsService.getUserFriendships(userId);
    }

    @Post()
    createFriendship(@Body() data: FriendshipDto) {
        validateInput(Joi.object({
            userId: ID_VALIDATOR.required(),
            friendId: ID_VALIDATOR.required(),
        }), data);
        Logger.log(data);
        return this.friendsipsService.createFriendship(data);
    }

    @Post("/:friendshipId")
    updateFriendship(@Param('friendshipId') friendshipId: string, @Body() data: FriendshipDto) {
        validateInput(Joi.object({
            friendshipId: ID_VALIDATOR.required(),
            isBlocked: Joi.boolean().required()
        }), {...data, friendshipId });
        return this.friendsipsService.updateFriendship(friendshipId, data.isBlocked);
    }

    @Delete("/:friendshipId")
    deleteFriendship(@Param('friendshipId') friendshipId: string) { 
        validateInput(Joi.object({
            friendshipId: ID_VALIDATOR.required(),
        }), {friendshipId });
        return this.friendsipsService.deleteFriendship(friendshipId);
    }
}
