import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UsersService as UsersService } from './users.service';
import { User } from './user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { validateInput } from 'src/utils/utils';
import * as Joi from 'joi';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    async create(@Body() user: User) {
        validateInput(Joi.object({
            id: Joi.string().guid().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            login42: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            username: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
        }), user);
        return this.usersService.createUser(user)
    }

    // @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<User[]> {
        return await (this.usersService.findAllUsers())
    }

    @Get('name/:username')
    async findUserByName(@Param('username') username: string): Promise<User> {
        return this.usersService.findOneByName(username)
    }
    
    @Get(':id')
    async findUser(@Param('id') id: string): Promise<User> {
        return this.usersService.findOneById(id)
    }

    @Put(':id')
    update(@Body() user: User, @Param('id') id: string): Promise<UpdateResult> {
        validateInput(Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            login42: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            username: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            is2fa: Joi.boolean(), //todo: revisar que pasa si is2fa está pero twofaSecret no
            twofaSecret: Joi.boolean(),
        }), user);
        return this.usersService.updateUser(id, user)
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<DeleteResult> {
        return this.usersService.deleteUser(id)
    }
}
