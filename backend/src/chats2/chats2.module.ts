import { Module } from '@nestjs/common';
import { Chats2Service } from './chats2.service';
import { Chats2Controller } from './chats2.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMembershipEntity, ChatMsgEntity, ChatRoomEntity } from './chatEntities.entity';
import { UserEntity } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
      ChatMembershipEntity,
      ChatMsgEntity,
      UserEntity,
    ]),
  ],
  providers: [Chats2Service, UsersService],
  controllers: [Chats2Controller],
  exports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
    ])],

})

export class Chats2Module {}
