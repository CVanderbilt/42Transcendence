import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipEntity } from './friendship.entity';
import { FriendshipsService } from './friendships.service';

@Module({
    imports: [TypeOrmModule.forFeature([FriendshipEntity])],
    providers: [FriendshipsService],

})
export class FriendshipsModule {}
