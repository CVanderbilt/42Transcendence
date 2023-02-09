

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { ChatGateway } from './chatSocket/chat.gateway';
import {GameGateway} from './gameSocket/game.gateway'
import { UserStatsModule } from './user-stats/user-stats.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { GamesModule } from './games/games.module';
import { MatchesModule } from './matches/matches.module';

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
    UserStatsModule,
    FriendshipsModule,
    GamesModule,
    MatchesModule
  ],
  controllers: [],
  providers: [ChatGateway, GameGateway],
})
export class AppModule {}
