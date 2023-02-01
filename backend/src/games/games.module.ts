import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from './game.entity';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
    imports: [TypeOrmModule.forFeature([GameEntity])],
    controllers: [GamesController],
    providers: [GamesService],
})
export class GamesModule {}
