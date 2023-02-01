import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStatsEntity } from './user-stats.entity';
import { UserStatsService } from './user-stats.service';
import { UserStatsController } from './user-stats.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserStatsEntity])],
    providers: [UserStatsService],
    controllers: [UserStatsController],
  })
export class UserStatsModule {
}
