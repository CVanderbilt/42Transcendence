import { Injectable } from '@nestjs/common';
import { GameEntity } from './game.entity';
import { Game } from './games.interface';

@Injectable()
export class GamesService {
    constructor() {}

    async findOne(id: number): Promise<Game> {
        return GameEntity.findOneBy({ id: id })
    }

    async find(): Promise<Game[]> {
        const list = await GameEntity
            .createQueryBuilder('match')
            .select()
            .orderBy('match.id', 'DESC')
            .offset(0)
            // .limit(10)
            .getMany();

        return await (list as Game[]);
    }
}