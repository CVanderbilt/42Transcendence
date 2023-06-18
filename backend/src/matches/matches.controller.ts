import { Controller, Get, Post, Param, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Match } from './match.interface';
import { User } from 'src/users/user.interface';
import { MatchesService } from './matches.service';
import { HttpStatusCode } from 'axios';

@Controller('matches')
export class MatchesController {
    constructor(private matchesService: MatchesService) { }

    @Get(':id')
    async findOne(
        @Param('id') id: string): Promise<Match> {
        return (await this.matchesService.findOne(id)).match;
    }

    @Get()
    async find(): Promise<Match[]> {
        return this.matchesService.find();
    }

    // todo: hacer que solo se puedan crear amistosos, competitivo se generan a través de matchmaking
    @Post(':userId/:type')
    async create(
        @Param('userId') userId: string,
        @Param('type') type: string,
        @Param('powerups') powerups: string,
    ): Promise<Match> {
        try {
            return await this.matchesService.createMatch(userId, type, powerups);
        } catch (error) {
            //Logger2.error(error)
        }
    }

    @Get('competitiveMatch/:userName')
    async getCompetitiveMatch(@Param('userName') userName: string): Promise<string> {
        try {
            console.log("getCompetitiveMatch called with userName: " + userName)
            const gameId = await this.matchesService.makeMatch(userName, 100, false, []);
            console.log("makeMatch funcionó y devuelve:")
            console.log(gameId)
            return gameId;
            //return await this.matchesService.joinMatch(userId, "competitive");
        } catch (error) {
            //Logger2.error(error)
            console.log("error getting competitive match")
            console.log(error)
            if (error instanceof HttpException) throw (error)
            throw new HttpException("competitive matchmaking failed", HttpStatusCode.InternalServerError);
        }
    }

    //todo: esto solo debe poder affectar a no competitive matches
    @Post('addOpponent/:userId/:matchId')
    async addOpponent(@Param('userId') userId: string, @Param('matchId') matchId: string): Promise<Match> {
        try {
            return await this.matchesService.addOpponent(userId, matchId);
        } catch (error) {
            //Logger2.error(error)
        }
    }

    //----------------------------------------------

    @Get('user/:userId')
    async getMatches(@Param('userId') userId: string): Promise<Match[]> {
        try {
            return await this.matchesService.getMatchesByUser(userId);
        } catch (error) {
            //Logger2.error(error)
        }
    }

    @Get('exhibitionMatch/:userName/:powerups')
    async getExhibitionMatch(
        @Param('userName') userName: string,
        @Param('powerups') powerups: string,
    ): Promise<string> {
        try {
            console.log("getCompetitiveMatch called with userName: " + userName)
            const powerupsList: string[] = []
            for (let i = 0; i < powerups.length; i++)
                powerupsList.push(powerups[i])
            const gameId = await this.matchesService.makeMatch(userName, 100, true, powerupsList);
            console.log("makeMatch funcionó y devuelve:")
            console.log(gameId)
            return gameId;
        } catch (error) {
            if (error instanceof HttpException) throw (error)
            throw new HttpException("friendly matchmaking failed", HttpStatusCode.InternalServerError);
        }
    }
    
}
