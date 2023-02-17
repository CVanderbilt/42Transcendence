import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';
// import { UserMapper } from './user.mapper';
import { AddChatController, UsernameController, UsersController, MuteUserController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController, UsernameController, AddChatController, MuteUserController],
  providers: [UsersService, UsersRepository, UserMapper]
})
export class UsersModule {}