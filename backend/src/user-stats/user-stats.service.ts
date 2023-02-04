import { Injectable } from '@nestjs/common';
import { UserStatsEntity } from './user-stats.entity';
import { UserStats } from './user-stats.interface';

@Injectable()
export class UserStatsService {
    constructor(
    ) { }

    async findOne(userId: string): Promise<UserStats> {
        return UserStatsEntity.findOneBy({ user: { userId: userId } })
    }
    async find(): Promise<UserStats[]> {
        const latests = await UserStatsEntity
            .createQueryBuilder('stats')
            .select()
            .orderBy('stats.id', 'DESC')
            .offset(0)
            .limit(10)
            .getMany();

        return await (latests as UserStats[]); // Hay una manera mejor ?
    }
}
