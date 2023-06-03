

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ChatGateway } from './webSockets/chat.gateway';
import { StateGateway } from './webSockets/state.gateway';
import { GameGateway } from './gameSocket/game.gateway'
import { FriendshipsModule } from './friendships/friendships.module';
import { GamesModule } from './games/games.module';
import { MatchesModule } from './matches/matches.module';
import { Chats2Module } from './chats2/chats2.module';
import { GameModule } from './gameSocket/game.module';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './GlobalExceptionFilter';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(<string>process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),    
    UsersModule,
    // ChatsModule,
    FriendshipsModule,
    GamesModule,
    MatchesModule,
    Chats2Module,
    AuthModule,
    StateGateway
  ],
  providers: [
    ChatGateway,
    GameGateway,
    StateGateway,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    }
  ],
})
export class AppModule {}
