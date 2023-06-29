import { Controller, Get, Post, Param, HttpException, Body, UseGuards, Req } from '@nestjs/common';
import { Match } from './match.interface';
import { MatchesService } from './matches.service';
import { HttpStatusCode } from 'axios';
import { ID_VALIDATOR, USERNAME_VALIDATOR, getAuthToken, processError, validateInput } from 'src/utils/utils';
import * as Joi from 'joi'
import { JwtAuthenticatedGuard } from 'src/auth/jwt-authenticated-guard';
import { UsersService } from 'src/users/users.service';

const POWERUPS_VALIDATOR = Joi.string().regex(/^[A-Z]+$/)

let counter = 0
@Controller('matches')
export class MatchesController {
    constructor(private matchesService: MatchesService, private usersService: UsersService) { }

    //Todo: cambiar todos los nombred de atributos (especialmente de cara a llamar las apis) de username a userid
    @UseGuards(JwtAuthenticatedGuard)
    @Get('competitiveMatch/:userName')
    async getCompetitiveMatch(@Param('userName') userName: string, @Req() req): Promise<string> {
        validateInput(Joi.object({
            userName: ID_VALIDATOR.required()
        }), { userName });
        const token = getAuthToken(req)
        if (userName !== token.userId)
            throw new HttpException("UserId in query and in token missmatch", HttpStatusCode.BadRequest)        
    
            // OJO aunq se llama username es userids
        const user = await this.usersService.findOneById(userName)
        try {
            console.log("getCompetitiveMatch called with userId " + userName + " and score: " + user.score + " _" + counter)
            counter++
            const gameId = await this.matchesService.makeMatch(userName, user.score, false, []);
            console.log("makeMatch funcionó y devuelve:")
            console.log(gameId)
            return gameId;
            //return await this.matchesService.joinMatch(userId, "competitive");
        } catch (error) {
            //Logger2.error(error)
            console.log("error getting competitive match")
            //console.log(error)
            if (error instanceof HttpException) throw (error)
            throw new HttpException("competitive matchmaking failed", HttpStatusCode.ImATeapot);
        }
    }

    //----------------------------------------------

    @UseGuards(JwtAuthenticatedGuard)
    @Get('user/:userId')
    async getMatches(@Param('userId') userId: string): Promise<Match[]> {
        validateInput(Joi.object({
            userName: ID_VALIDATOR.required()
        }), { userName: userId });
        console.log("getMatches called with userId: " + userId)
        try {
            return await this.matchesService.getMatchesByUser(userId);
        } catch (error) {
            console.log (error)
            throw new HttpException("error getting matches", HttpStatusCode.ImATeapot);
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Get('exhibitionMatch/:userName/:powerups')
    async getExhibitionMatch(
        @Param('userName') userName: string,
        @Param('powerups') powerups: string,
    ): Promise<string> {
        validateInput(Joi.object({
            userName: ID_VALIDATOR.required(),
            powerups: POWERUPS_VALIDATOR.required()
        }), { userName, powerups });
        try {
            console.log("friendly match called with userName: " + userName)
            const powerupsList: string[] = []
            for (let i = 0; i < powerups.length; i++)
                powerupsList.push(powerups[i])
            const gameId = await this.matchesService.makeMatch(userName, 100, true, powerupsList);
            console.log("makeMatch funcionó y devuelve:")
            console.log(gameId)
            return gameId;
        } catch (error) {
            if (error instanceof HttpException) throw (error)
            throw new HttpException("friendly matchmaking failed", HttpStatusCode.ImATeapot);
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('challenge')
    async challenge(@Body() data: { requesterName: string, opponentName: string, powerups: string }) {
        validateInput(Joi.object({
            requesterName: ID_VALIDATOR.required(),
            opponentName: ID_VALIDATOR.required(),
            powerups: POWERUPS_VALIDATOR.required()
        }), data);
        console.log("challenge y tal")
        const powerupsList: string[] = []
            for (let i = 0; i < data.powerups.length; i++)
                powerupsList.push(data.powerups[i])
        try {
            return await this.matchesService.challenge(data.requesterName, data.opponentName, powerupsList)
        } catch (error) {
            if (error instanceof HttpException) throw (error)
            throw new HttpException("competitive matchmaking failed", HttpStatusCode.ImATeapot);
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('getCurrentMatch')
    async getCurrentMatch(@Body() data: { userName: string }) {
        validateInput(Joi.object({
            userName: ID_VALIDATOR.required()
        }), data);
        try {
            return this.matchesService.getCurrentMatch(data.userName)
        } catch (error) {
            if (error instanceof HttpException) throw (error)
            throw new HttpException("get current match failed", HttpStatusCode.ImATeapot);
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('cancelMatchmaking')
    async cancelMatchmaking(@Req() req) {
        try {
            const token = getAuthToken(req)
            this.matchesService.cancelV2(token.userId)
        } catch (error) {
            console.log("processing error: " + JSON.stringify(error))
            if (error instanceof HttpException) throw (error)
            throw new HttpException("get current match failed", HttpStatusCode.ImATeapot);
            //throw processError(error, "cancel matchmaking failed")
        }
    }
}
