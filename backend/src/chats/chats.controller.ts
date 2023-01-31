import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ChatDTO } from './chat.dto';
import { chatsService } from './chats.service';

@Controller('chats')
export class chatsController {

    constructor(private chatsService: chatsService){}

    @Get()
    async getAllchats(): Promise<ChatDTO[]> {
        return await this.chatsService.getAllchats();
    }

    @Get(':id')
    async getchatById(@Param('id') id: string): Promise<ChatDTO> {
        return await this.chatsService.getchatById(id);
    }

    @Post()
    async newchat(@Body() chat: ChatDTO): Promise<ChatDTO> {
        return await this.chatsService.newchat(chat);
    }

    @Put(':id')
    async updatechat(@Param('id') id: string, @Body() chat: ChatDTO): Promise<ChatDTO> {
        return await this.chatsService.updatechat(id, chat);
    }

    @Delete(':id')
    async deletechat(@Param('id') id: string): Promise<void> {
        return await this.chatsService.deletechat(id);
    }

}

@Controller('chatname')
export class chatnameController {

    constructor(private chatsService: chatsService){}
    
    @Get(':chatname')
    async getchatBychatname(@Param('chatname') chatname: string): Promise<String> {
        return await (await this.chatsService.getchatBychatname(chatname)).id;
    }
}