import { Controller, Get, Inject, Param } from '@nestjs/common';
import { Game } from './games.interface';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
    constructor(private gamesService: GamesService) {}

    @Get(':id')
    async findOne(
        @Param('id') id: number): Promise<Game> {
        return this.gamesService.findOne(id);
    }

    @Get()
    async find() : Promise<Game[]> {
        return this.gamesService.find();
    }
}
