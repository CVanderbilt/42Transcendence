import { Injectable, NotFoundException } from '@nestjs/common';
import { MatchEntity } from './match.entity';
import { Match } from './match.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { User } from 'src/users/user.interface';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(MatchEntity)
        private readonly matchesRepo: Repository<MatchEntity>,
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>
    ) { }

    async findOne(matchId: string): Promise<Match> {
        return MatchEntity.findOneBy({ id: matchId })
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

    async createMatch(userId: string, type: string): Promise<Match> {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        const match = await this.matchesRepo.save({
            user: user,
            type: type
        })
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

    async getOpponentFreeCompetitiveMatch(): Promise<Match> {
        //const opponent = await this.usersRepo.findOne({ where: { id: userId } });
        const opponentFreeMatch = await this.matchesRepo.findOne({ where: { state: "Pending opponent", type: "Competitive" } });
        console.log(opponentFreeMatch)
        if (opponentFreeMatch) {
            return opponentFreeMatch
        }
        else {
            return
        }
    }

    async getCompetitiveMatch(userId: string): Promise<Match> {
        console.log("Ejecuta!!")
        const opponentFreeMatch = await this.getOpponentFreeCompetitiveMatch();
        //habria que cambiar esto para que el mismo usuario no se pueda meter de oponente a su propio partido
        if (opponentFreeMatch) {
            console.log("Añade el usuario a un partido ya existente")
            return this.addOpponent(userId, opponentFreeMatch.id)
        }
        else {
            console.log("Crea un partido")
            return this.createMatch(userId, "Competitive")
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
          userId: userId,
        })
        .getMany();

        // Swap user and opponent if opponent is the user
        list.forEach(element => {
            if (element.opponent.id == userId) {
                const o = element.user
                element.user = element.opponent
                element.opponent = o
                const s = element.playerScore
                element.playerScore = element.opponentScore
                element.opponentScore = s
            }
        })


        return await (list as Match[])
    }
}
