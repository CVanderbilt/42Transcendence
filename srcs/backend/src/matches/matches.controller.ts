import { Controller, Get, Post, Param, HttpException, Body, UseGuards, Req } from '@nestjs/common';
import { Match } from './match.interface';
import { MatchesService } from './matches.service';
import { HttpStatusCode } from 'axios';
import { ID_VALIDATOR, USERNAME_VALIDATOR, getAuthToken, processError, validateInput } from 'src/utils/utils';
import * as Joi from 'joi'
import { JwtAuthenticatedGuard } from 'src/auth/jwt-authenticated-guard';
import { UsersService } from 'src/users/users.service';

const POWERUPS_VALIDATOR = Joi.string().regex(/^[A-Z]+$/)

@Controller('matches')
export class MatchesController {
    constructor(private matchesService: MatchesService, private usersService: UsersService) { }

    @UseGuards(JwtAuthenticatedGuard)
    @Get('user/:userId')
    async getMatches(@Param('userId') userId: string): Promise<Match[]> {
        validateInput(Joi.object({
            userName: ID_VALIDATOR.required()
        }), { userName: userId });
        try {
            return await this.matchesService.getMatchesByUser(userId);
        } catch (error) {
            console.log (error)
            throw new HttpException("error getting matches", HttpStatusCode.ImATeapot);
        }
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('challenge')
    async challenge(@Req() req, @Body() data: { opponentId: string, powerups: string }) {
        validateInput(Joi.object({
            opponentId: ID_VALIDATOR.required(),
            powerups: POWERUPS_VALIDATOR.required()
        }), data);
        const token = getAuthToken(req)
        return this.matchesService.challenge(token.userId, data.opponentId, data.powerups)
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
}
