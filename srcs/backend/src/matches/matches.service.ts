import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { MatchEntity } from './match.entity';
import { Match } from './match.interface';
import { IsNull, Not, RemoveOptions, Repository, SaveOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { User } from 'src/users/user.interface';
import { gameRooms, user_games_map } from 'src/gameSocket/game.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(MatchEntity)
        private readonly matchesRepo: Repository<MatchEntity>,
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>
    ) {}

    getCurrentMatch(userName: string): string {
        const matchId = user_games_map[userName]
        if (!matchId)
            throw new HttpException("No ongoing match", HttpStatus.UNAUTHORIZED)
        return matchId
    }

    challenge(requesterName: string, opponentName: string, powerups: string): string {
        //return await this.matchMaker.challenge(requesterName, opponentName, powerups)
        const mid = user_games_map[requesterName]
        if (mid)
            throw new HttpException("User already in a match: " + mid, HttpStatus.CONFLICT)
        const id = uuidv4()
          //generate uuid
          const ballSpeed = powerups.includes("F") ? 4 : 2
          const paddleHeight = powerups.includes("S") ? 30 : 75
          gameRooms[id] = {
            id,
            gameStatus: "WAITING",
            numPlayers: 0,
            player1: {
              user: requesterName,
              paddlePos: 115,
              paddleHeight,
              upPressed: false,
              downPressed: false,
              inGame: false,
              score: 0
            },
            player2: {
              user: opponentName,
              paddlePos: 115,
              paddleHeight,
              upPressed: false,
              downPressed: false,
              inGame: false,
              score: 0
            },
            ballpos: { x: 250, y: 250, dx: ballSpeed, dy: ballSpeed },
            isCompetitive: false,
            isChallenge: true
          }
          return id
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
                match.user.score++;
                match.opponent.score--;
            } else {                
                match.opponent.score++;
                match.user.score--;
            }
        }

        if (players[0].score > players[1].score) {
            match.user.victories++;
            match.opponent.defeats++;
        } else {
            match.opponent.victories++;
            match.user.defeats++;
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

        return await (list as Match[]);
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
