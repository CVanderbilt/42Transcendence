import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { FriendshipEntity } from './friendship.entity';
import { FriendshipDto } from './friendships.dtos';
import { HttpStatusCode } from 'axios';

@Injectable()
export class FriendshipsService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
        @InjectRepository(FriendshipEntity)
        private readonly friendshipsRepo: Repository<FriendshipEntity>
    ) { }

    async getUserFriendships(userId: string) {
        const friendships = await this.friendshipsRepo.find({
            where: { user: { id: userId } },
            relations: ["friend"]
        });
        return friendships;
    }

    async updateFriendship2(userId: string, friendId: string, data: FriendshipDto) {
        let friendship = await this.friendshipsRepo.findOne({where: {user: {id: userId}, friend: {id: friendId}}})
        
        if (!friendship) {
            const user = await this.usersRepo.findOne({where: {id: userId}})
            const friend = await this.usersRepo.findOne({where: {id: friendId}})
            if (!user || !friend)
                throw new HttpException("User or friend not found", HttpStatusCode.NotFound)

            friendship = new FriendshipEntity();
            friendship.user = user
            friendship.friend = friend
            friendship.isBlocked = false;
            friendship.isFriend = false;
            friendship = await this.friendshipsRepo.save(friendship);
        }

        if (data.isBlocked !== undefined)
            friendship.isBlocked = data.isBlocked;
        if (data.isFriend !== undefined)
            friendship.isFriend = data.isFriend;

        friendship = await this.friendshipsRepo.save(friendship);

        return friendship;
    }
}
