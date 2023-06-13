import { Controller, Get, Post, Param, Logger } from '@nestjs/common';
import { Match } from './match.interface';
import { User } from 'src/users/user.interface';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
    constructor(private matchesService: MatchesService) { }

    @Get(':id')
    async findOne(
        @Param('id') id: string): Promise<Match> {
        return this.matchesService.findOne(id);
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

    /*
    Competitive matches no se generan mediante api, se generan a través del matchmaking
    @Get('competitiveMatch/:userId')
    async getCompetitiveMatch(@Param('userId') userId: string): Promise<Match> {
        try {
            return await this.matchesService.joinMatch(userId, "competitive");
        } catch (error) {
            //Logger2.error(error)
        }
    }*/

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

    @Get('exhibitionMatch/:userId/:powerups')
    async getExhibitionMatch(
        @Param('userId') userId: string,
        @Param('powerups') powerups: string,
    ): Promise<Match> {
        Logger.log("ExhibitionMatch")
        try {
            return await this.matchesService.joinMatch(userId, "exhibition", powerups);
        } catch (error) {
            //Logger2.error(error)
        }
    }
}
