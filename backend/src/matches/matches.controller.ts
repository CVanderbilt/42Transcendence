import { Controller, Get, Post, Param, Logger, HttpException, HttpStatus, Body } from '@nestjs/common';
import { Match } from './match.interface';
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
            //console.log(error)
            if (error instanceof HttpException) throw (error)
            throw new HttpException("competitive matchmaking failed", HttpStatusCode.InternalServerError);
        }
    }

    //----------------------------------------------

    @Get('user/:userId')
    async getMatches(@Param('userId') userId: string): Promise<Match[]> {
        console.log("getMatches called with userId: " + userId)
        try {
            return await this.matchesService.getMatchesByUser(userId);
        } catch (error) {
            console.log (error)
            throw new HttpException("error getting matches", HttpStatusCode.InternalServerError);
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

    @Post('challenge')
    async challenge(@Body() data: { requesterName: string, opponentName: string, powerups: string }) {
        console.log("challenge y tal")
        const powerupsList: string[] = []
            for (let i = 0; i < data.powerups.length; i++)
                powerupsList.push(data.powerups[i])
        try {
            return await this.matchesService.challenge(data.requesterName, data.opponentName, powerupsList)
        } catch (error) {
            if (error instanceof HttpException) throw (error)
            throw new HttpException("competitive matchmaking failed", HttpStatusCode.InternalServerError);
        }
    }
}
