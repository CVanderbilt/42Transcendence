import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { Match } from './match.interface';
import { MatchesService } from './matches.service';
import { MatchDto } from './match.dto';

@Controller('matches')
export class MatchesController {
    constructor (private matchesService: MatchesService) {}

    @Get(':id')
    async findOne(
        @Param('id') id: number): Promise<Match> {
        return this.matchesService.findOne(id);
    }

    @Get()
    async find() : Promise<Match[]> {
        return this.matchesService.find();
    }

    /*@Post('match')
    async create(@Body() dto: MatchDto): Promise<Match> {
        try {
            return await this.matchesService.getMatch(dto)
        } catch (error) {
            //Logger2.error(error)
        }
    }*/
}
