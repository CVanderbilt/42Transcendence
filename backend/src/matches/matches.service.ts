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

    async makeMatch(userId: string, score: number): Promise<string> {
        return await this.matchMaker.makeMatch(userId, score)
    }

    matchEnded(user1: string, user2: string) {
        this.matchMaker.matchEnded(user1, user2)
    }

    async matchAftermath(
        id: string,
        players: [{ name: string, score: number }, { name: string, score: number }]
    ) {
        console.log(`[${id}] -> players: {${players[0].name},${players[0].score}}, {${players[1].name},${players[1].score}}`)
        const match = await this.matchesRepo.findOne({ where: { id }, relations: ["user", "opponent"] })
        //todo: a lo mejor preferimos fallar silenciosamente aquí
        //todo: revisar porq matchEntity puede no tener id ?
        if (!match)
            throw Error(`match with id: ${id} not found`)
        const player = players.find(p => p.name === match.user.username)
        const opponent = players.find(p => p.name === match.opponent.username)
        if (!player)
            throw Error(`no recieved player from: ${players} was user: ${match.user}`)
        if (!opponent)
            throw Error(`no recieved player from: ${players} was opponent: ${match.opponent}`)
        match.playerScore = player.score
        match.opponentScore = opponent.score
        if (player.score > opponent.score) {
            match.user.victories++;
            match.opponent.defeats++;
        } else {
            match.opponent.victories++;
            match.user.defeats++;
        }
        match.isFinished = true;
        match.save();
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

    async getPlayerOne(matchId: string): Promise<User> {
        const match = await MatchEntity.findOneBy({ id: matchId })
        console.log(match)
        return match.user
    }

    async getPlayerTwo(matchId: string): Promise<User> {
        const match = await MatchEntity.findOneBy({ id: matchId })
        return match.opponent
    }

    async createMatch(userId: string, type: string, powerups: string): Promise<Match> {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        const match = await this.matchesRepo.save({
            user: user,
            type: type,
            powerups: powerups,
            state: "Pending opponent"
        })

        console.log(match)
        return match
    }

    async addOpponent(userId: string, matchId: string): Promise<Match> {
        const opponent = await this.usersRepo.findOne({ where: { id: userId } });
        const match = await this.matchesRepo.findOne({ where: { id: matchId } });
        if (match) {
            this.matchesRepo.update({ id: matchId }, { opponent: opponent, state: "Full" });
            const updatedMatch = await this.matchesRepo.findOne({ where: { id: matchId } });
            return updatedMatch
        }
        else {
            throw new NotFoundException('That MatchID does not exist')
        }
    }

    //todo: hacer que esto solo sirva para encontrar partidas amistosas, las competitivas van por el socket directamente
    //    de hecho competitive match solo está usando el de crear y el de guardar (ni siquiera usa goles y demás)
    async getOpponentAvailableMatch(type: string, userId: string): Promise<Match | null> {
        try {
            const pendingMatches = await this.matchesRepo.find({
                where: {
                    state: 'Pending opponent',
                    type: type,
                    opponent: IsNull(),
                },
                relations: ['user', 'opponent']
            });

            console.log("pending matches")
            console.log(pendingMatches)

            if (pendingMatches.length === 0) {
                return null
            }

            const sameId = pendingMatches.filter((match) => match.user.id === userId);
            console.log("same id") 
            console.log(sameId)
            if (pendingMatches.length > sameId.length)
                {
                    console.log("returning match")
                    console.log(pendingMatches[sameId.length])
                    return pendingMatches[sameId.length]
                }
            else
                return null
        } catch (error) {
            console.error("Error in getOpponentAvailableMatch:", error);
            throw error;
        }
    }

    async joinMatch(userId: string, type: string, powerups: string = ""): Promise<Match> {
        const opponentFreeMatch = await this.getOpponentAvailableMatch(type, userId);
        console.log(opponentFreeMatch)
        if (opponentFreeMatch) {
            console.log("Añade el usuario a un partido ya existente")
            return this.addOpponent(userId, opponentFreeMatch.id)
        }
        else {
            console.log("Crea un partido")
            return this.createMatch(userId, type, powerups)
        }
    }

    async localGoal(matchId: string): Promise<{}> {
        const match = await this.matchesRepo.findOne({ where: { id: matchId } });
        //habria que cambiar esto para que el mismo usuario no se pueda meter de oponente a su propio partido
        if (match) {
            if (match.playerScore + 1 == 5) {
                this.matchesRepo.update({ id: matchId }, { playerScore: (match.playerScore + 1), isFinished: true });
            }
            else {
                this.matchesRepo.update({ id: matchId }, { playerScore: (match.playerScore + 1) });
            }
            return
        }
        else {
            throw new NotFoundException('That MatchID does not exist')
        }
    }

    async opponentGoal(matchId: string): Promise<{}> {
        const match = await this.matchesRepo.findOne({ where: { id: matchId } });
        //habria que cambiar esto para que el mismo usuario no se pueda meter de oponente a su propio partido
        if (match) {
            if (match.opponentScore + 1 == 5) {
                this.matchesRepo.update({ id: matchId }, { opponentScore: (match.opponentScore + 1), isFinished: true });
            }
            else {
                this.matchesRepo.update({ id: matchId }, { opponentScore: (match.opponentScore + 1) });
            }
            return
        }
        else {
            throw new NotFoundException('That MatchID does not exist')
        }
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
                const s = element.playerScore
                element.playerScore = element.opponentScore
                element.opponentScore = s
            }
        }

        return await (list as Match[])
    }
}
