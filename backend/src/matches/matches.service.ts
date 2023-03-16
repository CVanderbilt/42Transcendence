import { Injectable } from '@nestjs/common';
import { MatchEntity } from './match.entity';
import { Match } from './match.interface';
import { MatchDto } from './match.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';

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

        /*async getMatch(matchDto: MatchDto): Promise<Match> {
            const user = await this.usersRepo.findOne({ where: { id: matchDto.user } });
            // check whether the room name is already taken
            const existingMatch = await this.matchesRepo.findOne({ where: { id: matchDto.id } })
            if (existingMatch) {
                return existingMatch
            }
            // create room
            const match = await this.matchesRepo.save({
                user: user,
            })
            return match
        }*/
}
