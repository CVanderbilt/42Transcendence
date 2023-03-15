import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Chats2Service } from 'src/chats2/chats2.service';
import { Chats2Module } from 'src/chats2/chats2.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    Chats2Module
  ],
  providers: [
    UsersService,
    Chats2Service
    ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
