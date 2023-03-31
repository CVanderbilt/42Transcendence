import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { validateInput } from 'src/utils/utils';
import { FriendshipDto } from './friendships.dtos';
import { FriendshipsService } from './friendships.service';
import * as Joi from 'joi'

@Controller('friendships')
export class FriendshipsController {
    constructor(private friendsipsService: FriendshipsService) {}

    @Get("/user/:userId")
    getFriendships(@Param('userId') userId: string) : Promise<FriendshipDto[]> {
        return this.friendsipsService.getUserFriendships(userId);
    }

    @Post()
    createFriendship(@Body() data: FriendshipDto) {
        validateInput(Joi.object({
            userId: Joi.string().guid().required(),
            friendId: Joi.string().guid().required(),
        }), data);
        Logger.log(data);
        return this.friendsipsService.createFriendship(data);
    }

    @Post("/:friendshipId")
    updateFriendship(@Param('friendshipId') friendshipId: string, @Body() data: FriendshipDto) {
        validateInput(Joi.object({
            isBlocked: Joi.boolean().required(),
        }), data);
        return this.friendsipsService.updateFriendship(friendshipId, data.isBlocked);
    }

    @Delete("/:friendshipId")
    deleteFriendship(@Param('friendshipId') friendshipId: string) { 
        return this.friendsipsService.deleteFriendship(friendshipId);
    }
}
