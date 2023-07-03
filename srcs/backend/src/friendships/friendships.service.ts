import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { FriendshipEntity } from './friendship.entity';
import { FriendshipDto } from './friendships.dtos';

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

    //create a friendship
    async createFriendship(userId: string, data: FriendshipDto) {
        console.log("creating friendship");
        let friendship = await this.friendshipsRepo.findOne({ where: { user: { id: userId }, friend: { id: data.friendId } } })
        if (!friendship) {
            friendship = new FriendshipEntity();
            friendship.user = await this.usersRepo.findOneBy({ id: userId });
            friendship.friend = await this.usersRepo.findOneBy({ id: data.friendId });
            friendship.isBlocked = false;        
        }
        
        console.log("is friend " + friendship.isFriend);
        friendship.isFriend = data.isFriend ? data.isFriend : true;
        friendship = await this.friendshipsRepo.save(friendship);
        return friendship
    }

    //update a friendship
    async updateFriendship(friendshipId: string, data: FriendshipDto) {
        try {
            const friendship = await this.friendshipsRepo.findOneOrFail({ where: { id: friendshipId } })
            if (data.isBlocked !== undefined)
                friendship.isBlocked = data.isBlocked;
            if (data.isFriend !== undefined)
                friendship.isFriend = data.isFriend;
            await this.friendshipsRepo.save(friendship);
            return friendship;
        }
        catch (err) {
            console.log(err);
        }
    }
}