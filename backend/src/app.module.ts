

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { ChatGateway } from './chatSocket/chat.gateway';
import {GameGateway} from './gameSocket/game.gateway'
import { FriendshipsModule } from './friendships/friendships.module';
import { GamesModule } from './games/games.module';
import { MatchesModule } from './matches/matches.module';
import { Chats2Module } from './chats2/chats2.module';
import { AuthModule } from './auth/auth.module';

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
    ChatsModule,
    FriendshipsModule,
    GamesModule,
    MatchesModule,
    Chats2Module,
    AuthModule,
  ],
  controllers: [],
  providers: [ChatGateway, GameGateway],
})
export class AppModule {}
