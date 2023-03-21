import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UsersService as UsersService } from './users.service';
import { User } from './user.interface';
import { Multer } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'typeorm/platform/PlatformTools';
var fs  = require('fs'),
path    = require('path'),
url     = require('url');

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    async create(@Body() user: User) {
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

    //todo: cambiar tipo de User a uno que solo contenga lo que se puede cambiar (nombre, email, password, is2fa, 2fasecret? ), no queremos que nadie pueda cambiar sus estadísticas por ejemplo
    @Put(':id')
    update(@Body() user: User, @Param('id') id: string): Promise<UpdateResult> {
        delete user.id // cuando hagamos el todo de arriba estos dos deletes no serán necesarios, pero habrá que crear un objeto tipo User con los parametros definidos
        delete user.image
        return this.usersService.updateUser(id, user)
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
}
