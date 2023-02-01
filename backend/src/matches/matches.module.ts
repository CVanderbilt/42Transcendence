import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './match.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity])],
    controllers: [MatchesController],
    providers: [MatchesService],
    // providers: [UserStatsService],
    // controllers: [UserStatsController],
})
export class MatchesModule {}
