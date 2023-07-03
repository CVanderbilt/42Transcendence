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

    getCurrentMatch(userName: string): string {
        return this.matchMaker.getCurrentMatch(userName)
    }

    cancel(userName: string): boolean {
        return this.matchMaker.cancel(userName)
    }

    cancelV2(userId: string) {
        this.matchMaker.cancelV2(userId)
    }

    async challenge(requesterName: string, opponentName: string, powerups: string[]): Promise<string> {
        return await this.matchMaker.challenge(requesterName, opponentName, powerups)
    }

    acceptChallenge(gameId: string, userName: string, challengedBy: string): boolean {
        return this.matchMaker.lockPlayerFromChallenge(gameId, userName, challengedBy)
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
        // console.log(`[${id}] -> players: {${players[0].name},${players[0].score}}, {${players[1].name},${players[1].score}}`)

        const existingMatch = await this.matchesRepo.findOne({ where: { id } })
        if (existingMatch)
            return

        const user = await this.usersRepo.findOne({ where: { id: players[0].name } })
        const opponent = await this.usersRepo.findOne({ where: { id: players[1].name } })
        if (!user) {
            // console.log(`no recieved player from: ${players} was user: ${user}`)
            return
        }
        if (!opponent) {
            // console.log(`no recieved player from: ${players} was opponent: ${opponent}`)
            return
        }

        const match = await this.matchesRepo.create({
            id: id,
            user: user,
            opponent: opponent,
            type: type,
            userScore: players[0].score,
            opponentScore: players[1].score,
            winner: players[0].score > players[1].score ? user : opponent,
        })

        if (type === 'Competitive') {
            if (players[0].score > players[1].score) {
                match.user.victories++;
                match.opponent.defeats++;
                match.user.score++;
                match.opponent.score--;
            } else {
                match.opponent.victories++;
                match.user.defeats++;
                match.opponent.score++;
                match.user.score--;
            }
        }

        match.user.save()
        match.opponent.save()

        match.save()
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
