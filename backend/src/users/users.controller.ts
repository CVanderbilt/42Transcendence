import { Body, Controller, Delete, Get, HttpException, Logger, Param, Post, Put, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UsersService as UsersService } from './users.service';
import { User } from './user.interface';
import { Multer } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'typeorm/platform/PlatformTools';
var fs  = require('fs'),
path    = require('path'),
url     = require('url');
import { getAuthToken, validateInput } from 'src/utils/utils';
import * as Joi from 'joi';
import { JwtAdminGuard } from 'src/auth/jwt-admin-guard';
import { plainToClass } from 'class-transformer';
import { UserDto } from './user.dto';


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

    @UseGuards(JwtAdminGuard)
    @Post(':id/ban')
    async banUser(@Param('id') id: string): Promise<void> {
        this.usersService.setUserIsBanned(id, true);
    }
    
    @UseGuards(JwtAdminGuard)
    @Post(':id/allow')
    async allowUser(@Param('id') id: string): Promise<void> {
        this.usersService.setUserIsBanned(id, false);
    }

    @UseGuards(JwtAdminGuard)
    @Post(':id/promote')
    async promoteUser(@Param('id') id: string): Promise<void> {
        this.usersService.setUserAsAdmin(id);
    }
    
    @UseGuards(JwtAdminGuard)
    @Post(':id/demote')
    async demoteUser(@Param('id') id: string): Promise<void> {
        await this.usersService.setUserAsCustomer(id);
    }
    
    // @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<UserDto[]> {
        // transforma el array de usuarios en un array de UserDto
        const users = await this.usersService.findAllUsers()
        return users.map(user => new UserDto(user))
    }

    @Get('name/:username')
    async findUserByName(@Param('username') username: string): Promise<UserDto> {
        const user = await this.usersService.findOneByName(username)
        if (!user)
            throw new HttpException(`User ${username} not found`, 404)

        return new UserDto(user) // para no devolver el password
    }
    
    @Get(':id')
    async findUser(@Param('id') id: string): Promise<User> {
        return new UserDto( await this.usersService.findOneById(id) )
    }

    // admins y el propio usuario a modificar
    @Put(':id')
    async update(@Body() user: User, @Param('id') id: string, @Req() request: Request): Promise<UpdateResult> {
        validateInput(Joi.object({
            email: Joi.string().email(),
            password: Joi.string(),
            login42: Joi.string().regex(/^[a-zA-Z0-9-_]+$/),
            username: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).required(),
            is2fa: Joi.boolean(), //todo: revisar que pasa si is2fa está pero twofaSecret no
            twofaSecret: Joi.boolean(),
        }), user);
        const token = getAuthToken(request)
        if (token.hasRightsOverUser(token, await this.usersService.findOneById(id)))
            return this.usersService.updateUser(id, user)
        throw new UnauthorizedException(`Requester (${token.userId}) is not allowed to modify user ${id}`)
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<DeleteResult> {
        return this.usersService.deleteUser(id)
    }

    @Get(':id/image')
    async getImageById(@Res({ passthrough: false }) response: Response, @Param('id') id: string) {
        const image = await this.usersService.getFileById(id);
        const stream = !image ?
            fs.createReadStream(path.join(process.cwd(), 'public/noPictureProfile.png')) :
            Readable.from(image);
        
        stream.pipe(response);
    }

    @Put(':id/image')
    @UseInterceptors(FileInterceptor('file'))
    async setImage(@Param('id') id: string, @UploadedFile() file: Multer.File) {
        return this.usersService.uploadDatabaseFile(file.buffer, id)
    }

    @Post('ladder')
    async getLadder(): Promise<User[]> {
        Logger.log('getLadder')
        return null
    }
}
