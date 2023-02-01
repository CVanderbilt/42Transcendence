import { Controller, Get, Param } from '@nestjs/common';
import { UserStats } from './user-stats.interface';
import { UserStatsService } from './user-stats.service';

@Controller('user-stats')
export class UserStatsController {
    constructor (private statsService: UserStatsService) {}

    @Get(':userId')
    async findOne(
        @Param('userId') userId: string): Promise<UserStats> {
        return this.statsService.findOne(userId);
    }

    @Get()
    async find() : Promise<UserStats[]> {
        return this.statsService.find();
    }
}
