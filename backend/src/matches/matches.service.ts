import { Injectable } from '@nestjs/common';
import { MatchEntity } from './match.entity';
import { Match } from './match.interface';

@Injectable()
export class MatchesService {
    constructor(
        ) { }
    
        async findOne(userId: number): Promise<Match> {
            return MatchEntity.findOneBy({ id: userId })
        }
        async find(): Promise<Match[]> {
            const list = await MatchEntity
                .createQueryBuilder('match')
                .select()
                .orderBy('match.id', 'DESC')
                .offset(0)
                // .limit(10)
                .getMany();
    
            return await (list as Match[]); // Hay una manera mejor ?
        }
}
