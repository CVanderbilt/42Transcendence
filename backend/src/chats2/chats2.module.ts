import { Module } from '@nestjs/common';
import { Chats2Service } from './chats2.service';
import { Chats2Controller } from './chats2.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMembershipEntity, ChatMsgEntity, ChatRoomEntity, DirectMsgEntity, DuologueEntity } from './chatEntities.entity';
import { UserEntity } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
      ChatMembershipEntity,
      ChatMsgEntity,
      UserEntity,
      DuologueEntity,
      DirectMsgEntity,
    ]),
  ],
  providers: [Chats2Service],
  controllers: [Chats2Controller],
  exports: [
    TypeOrmModule.forFeature([
      ChatRoomEntity,
    ])],

})

export class Chats2Module {}
