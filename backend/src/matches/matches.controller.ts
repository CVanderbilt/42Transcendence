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
            console.log(error)
            if (error instanceof HttpException) throw (error)
            throw new HttpException("competitive matchmaking failed", HttpStatusCode.InternalServerError);
        }
    }

    //----------------------------------------------

    @Get('user/:userId')
    async getMatches(@Param('userId') userId: string): Promise<Match[]> {
        try {
            return await this.matchesService.getMatchesByUser(userId);
        } catch (error) {
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

    /*
    WIP
    @Post('challenge')
    async challenge(@Body data: { requesterName: string, oponentName: string }) {
        // crea duelo entre requester y oponent
        // se añaden ambos a la base de datos y si el otro jugador acepta el duelo matchean
        // requester se añade al mapa, con atribute waiting_for = oponentName, solo matchea con users llamados oponentName que estén con waiting_for = requesterName
    }

    @Post('challengeAnswer')
    async challengeAnswer(@Body data: { requesterName: string, oponentName: string, accepted: boolean }) {
        
    }*/
}
