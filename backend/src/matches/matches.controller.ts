import { Controller, Get, Param } from '@nestjs/common';
import { Match } from './match.interface';
import { MatchesService } from './matches.service';

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
}
