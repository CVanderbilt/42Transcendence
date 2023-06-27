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
import { BOOLEAN_VALIDATOR, EMAIL_VALIDATOR, getAuthToken, ID_VALIDATOR, PASSWORD_VALIDATOR, USERNAME_VALIDATOR, validateInput } from 'src/utils/utils';
import * as Joi from 'joi';
import { JwtAdminGuard } from 'src/auth/jwt-admin-guard';
import { UserDto } from './user.dto';
import { JwtAuthenticatedGuard } from 'src/auth/jwt-authenticated-guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    async create(@Body() user: User) {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
            email: EMAIL_VALIDATOR.required(),
            password: PASSWORD_VALIDATOR.required(),
            login42: USERNAME_VALIDATOR.required(),
            username: USERNAME_VALIDATOR.required(),
        }), user);
        return this.usersService.createUser(user)
    }

    @UseGuards(JwtAdminGuard)
    @Post(':id/ban')
    async banUser(@Param('id') id: string): Promise<void> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        this.usersService.setUserIsBanned(id, true);
    }
    
    @UseGuards(JwtAdminGuard)
    @Post(':id/allow')
    async allowUser(@Param('id') id: string): Promise<void> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        this.usersService.setUserIsBanned(id, false);
    }

    @UseGuards(JwtAdminGuard)
    @Post(':id/promote')
    async promoteUser(@Param('id') id: string): Promise<void> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        this.usersService.setUserAsAdmin(id);
    }
    
    @UseGuards(JwtAdminGuard)
    @Post(':id/demote')
    async demoteUser(@Param('id') id: string): Promise<void> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        await this.usersService.setUserAsCustomer(id);
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Get()
    async findAll(): Promise<UserDto[]> {
        const users = await this.usersService.findAllUsers()
        return users.map(user => new UserDto(user))
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Get('name/:username')
    async findUserByName(@Param('username') username: string): Promise<UserDto> {
        validateInput(Joi.object({
            username: USERNAME_VALIDATOR.required(),
        }), { username });
        const user = await this.usersService.findOneByName(username)
        if (!user)
            throw new HttpException(`User ${username} not found`, 404)

        return new UserDto(user)
    }
    
    @UseGuards(JwtAuthenticatedGuard)
    @Get(':id')
    async findUser(@Param('id') id: string): Promise<User> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        return new UserDto( await this.usersService.findOneById(id) )
    }

    // todo: deberíamos probar a llamar a todas las apis comprobando todos los casos de unauthorized
    // admins y el propio usuario a modificar (ese check es más complejo y se hace abajo con token.hasRightsOverUser)
    @UseGuards(JwtAuthenticatedGuard)
    @Put(':id')
    async update(@Body() user: User, @Param('id') id: string, @Req() request: Request): Promise<UpdateResult> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
            email: EMAIL_VALIDATOR,
            password: PASSWORD_VALIDATOR,
            login42: USERNAME_VALIDATOR,
            username: USERNAME_VALIDATOR.required(),
            is2fa: BOOLEAN_VALIDATOR,
            twofaSecret: BOOLEAN_VALIDATOR,
        }), { ...user, id });
        const token = getAuthToken(request)
        if (token.hasRightsOverUser(token, await this.usersService.findOneById(id)))
            return this.usersService.updateUser(id, user)
        throw new UnauthorizedException(`Requester (${token.userId}) is not allowed to modify user ${id}`)
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() request: Request): Promise<DeleteResult> {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        const token = getAuthToken(request)
        if (token.hasRightsOverUser(token, await this.usersService.findOneById(id)))
            return this.usersService.deleteUser(id)
        throw new UnauthorizedException(`Requester (${token.userId}) is not allowed to delete user ${id}`)
    }

    //Public info
    @Get(':id/image')
    async getImageById(@Res({ passthrough: false }) response: Response, @Param('id') id: string) {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        const image = await this.usersService.getFileById(id);
        const stream = !image ?
            fs.createReadStream(path.join(process.cwd(), 'public/noPictureProfile.png')) :
            Readable.from(image);
        
        stream.pipe(response);
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Put(':id/image')
    @UseInterceptors(FileInterceptor('file'))
    async setImage(@Param('id') id: string, @UploadedFile() file: Multer.File, @Req() request: Request) {
        validateInput(Joi.object({
            id: ID_VALIDATOR.required(),
        }), { id });
        const token = getAuthToken(request)
        if (token.hasRightsOverUser(token, await this.usersService.findOneById(id)))
            return this.usersService.uploadDatabaseFile(file.buffer, id)
        throw new UnauthorizedException(`Requester (${token.userId}) is not allowed to change image of user: ${id}`)
    }

    @UseGuards(JwtAuthenticatedGuard)
    @Post('ladder')
    async getLadder(): Promise<User[]> {
        Logger.log('getLadder')
        return null
    }
}
