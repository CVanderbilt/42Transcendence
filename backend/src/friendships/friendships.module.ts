import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipEntity } from './friendship.entity';
import { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { UserEntity } from 'src/users/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([FriendshipEntity]),
        TypeOrmModule.forFeature([UserEntity]),
    ],
    providers: [FriendshipsService],
    controllers: [FriendshipsController],
})
export class FriendshipsModule {}
