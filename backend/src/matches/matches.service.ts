import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchEntity } from './match.entity';
import { Match } from './match.interface';
import { IsNull, Not, RemoveOptions, Repository, SaveOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { User } from 'src/users/user.interface';
import { MatchMaker } from './matchmaking';

@Injectable()
export class MatchesService {
    private readonly matchMaker: MatchMaker
    constructor(
        @InjectRepository(MatchEntity)
        private readonly matchesRepo: Repository<MatchEntity>,
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>
    ) { 
        this.matchMaker = new MatchMaker(matchesRepo, usersRepo)
    }

    async makeMatch(userId: string, score: number, isFriendly: boolean, powerups: string[]): Promise<string> {
        return await this.matchMaker.makeMatch(userId, score, isFriendly, powerups)
    }

    matchEnded(user1: string, user2: string) {
        this.matchMaker.matchEnded(user1, user2)
    }

    async matchAftermath(
        id: string,
        players: [{ name: string, score: number }, { name: string, score: number }],
        type: "Competitive" | "Exhibition",
    ) {
        console.log(`[${id}] -> players: {${players[0].name},${players[0].score}}, {${players[1].name},${players[1].score}}`)
        
        const existingMatch = await this.matchesRepo.findOne({ where: { id } })
        if (existingMatch)
           return
        
        const user = players.find(p => p.name === match.user.username)
        const opponent = players.find(p => p.name === match.opponent.username)
        if (!user)
        throw Error(`no recieved player from: ${players} was user: ${user}`)
        if (!opponent)
        throw Error(`no recieved player from: ${players} was opponent: ${opponent}`)


        const match = await this.matchesRepo.create({
            id: id,
            user: user,
            opponent: opponent,
            type: type,
            userScore: user.score,
            opponentScore: opponent.score,
            winner: user.score > opponent.score ? user : opponent,
        })

        if (user.score > opponent.score) {
            match.user.victories++;
            match.opponent.defeats++;
        } else {
            match.opponent.victories++;
            match.user.defeats++;
        }

        match.user.save()
        match.opponent.save()
    }

    async findOne(matchId: string): Promise<{ match: Match, player: User, opponent: User }> {
        const matchEntity = await MatchEntity.findOne({ where: { id: matchId }, relations: ["user", "opponent"] })
        return {
            match: matchEntity,
            player: matchEntity.user,
            opponent: matchEntity.opponent
        }
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


    //----------------------------------------------

    async getMatchesByUser(userId: string): Promise<Match[]> {

        const list: MatchEntity[] = await this.matchesRepo
            .createQueryBuilder("match")
            .leftJoinAndSelect("match.user", "user")
            .leftJoinAndSelect("match.opponent", "opponent")
            .where("match.user.id = :userId OR match.opponent.id = :userId", {
                userId: userId
            })
            .where("match.state = :state", { 
                state: "Full" 
            })
            .getMany();

        for (let index = 0; index < list.length; index++) {
            const element = list[index];

            if (element.opponent.id == userId) {
                const o = element.user
                element.user = element.opponent
                element.opponent = o
                const s = element.userScore
                element.userScore = element.opponentScore
                element.opponentScore = s
            }
        }

        return await (list as Match[])
    }
}
