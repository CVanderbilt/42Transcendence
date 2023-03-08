import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UsersService as UsersService } from './users.service';
import { User } from './user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    // @Post()
    // async create(@Body() user: User) {
    //     return this.usersService.createUser(user)
    // }

    // @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<User[]> {
        return await (this.usersService.findAllUsers())
    }

    @Get(':id')
    async findUser(@Param('id') id: string): Promise<User> {
        return this.usersService.findOneById(id)
    }

    @Put(':id')
    update(@Body() user: User, @Param('id') id: string): Promise<UpdateResult> {
        return this.usersService.updateUser(id, user)
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<DeleteResult> {
        return this.usersService.deleteUser(id)
    }    
}
