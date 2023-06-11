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

    @Get('/playerOne/:id')
    async getPlayerOne(
        @Param('id') id: string): Promise<User> {
        return this.matchesService.getPlayerOne(id);
    }

    @Get('/playerTwo/:id')
    async getPlayerTwo(
        @Param('id') id: string): Promise<User> {
        return this.matchesService.getPlayerTwo(id);
    }

    @Get()
    async find(): Promise<Match[]> {
        return this.matchesService.find();
    }

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

    @Get('competitiveMatch/:userId')
    async getCompetitiveMatch(@Param('userId') userId: string): Promise<Match> {
        try {
            return await this.matchesService.joinMatch(userId, "competitive");
        } catch (error) {
            //Logger2.error(error)
        }
    }

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
