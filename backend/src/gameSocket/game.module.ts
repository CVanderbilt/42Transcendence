import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from '../matches/match.entity';
import { MatchesController } from '../matches/matches.controller';
import { MatchesService } from '../matches/matches.service';
import { UserEntity } from 'src/users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MatchEntity,
        UserEntity, MatchesService])],
    controllers: [MatchesController],
    providers: [MatchesService],
    // providers: [UserStatsService],
    // controllers: [UserStatsController],
})
export class GameModule {}