import { Body, Controller, Delete, Get, Logger, Param, Post } from '@nestjs/common';
import { FriendshipDto } from './friendships.dtos';
import { FriendshipsService } from './friendships.service';

@Controller('friendships')
export class FriendshipsController {
    constructor(private friendsipsService: FriendshipsService) {}

    @Get("/user/:userId")
    getFriendships(@Param('userId') userId: string) : Promise<FriendshipDto[]> {
        return this.friendsipsService.getUserFriendships(userId);
    }

    @Post()
    createFriendship(@Body() data: FriendshipDto) {
        Logger.log(data);
        return this.friendsipsService.createFriendship(data);
    }

    @Post("/:friendshipId")
    updateFriendship(@Param('friendshipId') friendshipId: string, @Body() data: FriendshipDto) {
        return this.friendsipsService.updateFriendship(friendshipId, data.isBlocked);
    }

    @Delete("/:friendshipId")
    deleteFriendship(@Param('friendshipId') friendshipId: string) { 
        return this.friendsipsService.deleteFriendship(friendshipId);
    }
}
