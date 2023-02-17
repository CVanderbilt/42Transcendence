import { Module } from '@nestjs/common';
import { Chats2Service } from './chats2.service';
import { Chats2Controller } from './chats2.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMembershipEntity, ChatMsgEntity, ChatRoomEntity, DirectMsgEntity, DuologueEntity } from './chatEntities.entity';
import { UserEntity } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoomEntity]),
    TypeOrmModule.forFeature([ChatMembershipEntity]),
    TypeOrmModule.forFeature([ChatMsgEntity]),
    TypeOrmModule.forFeature([UserEntity]),
    TypeOrmModule.forFeature([DuologueEntity]),
    TypeOrmModule.forFeature([DirectMsgEntity]),
  ],
  providers: [Chats2Service],
  controllers: [Chats2Controller]
})

export class Chats2Module {}
