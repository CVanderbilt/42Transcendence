
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ChatDTO } from './chat.dto';
import { chatEntity } from './chat.entity';
import { chatMapper } from './chat.mapper';

@Injectable()
export class chatsRepository {

    constructor(
        @InjectRepository(chatEntity) private chatsRepository: Repository<chatEntity>,
        private mapper: chatMapper){}

    getAllchats(): Promise<chatEntity[]> {
        return this.chatsRepository.find();
    }

    getchatById(id: string): Promise<chatEntity> {
        return this.chatsRepository.findOneBy({chatId : id});
    }

    getchatBychatname(chatname: string): Promise<chatEntity> {
        return this.chatsRepository.findOneBy({chatname : chatname});
    }

    async newchat(chatDTO: ChatDTO): Promise<chatEntity> {
        const newchat = this.mapper.dtoToEntity(chatDTO);
        return this.chatsRepository.save(newchat);
    }

    async updatechat(id: string, chatDTO: ChatDTO): Promise<chatEntity> {
        const updateChatDTO: ChatDTO = new ChatDTO(id, chatDTO.chatname, chatDTO.password, chatDTO.messages);
        const updateChat = this.mapper.dtoToEntity(updateChatDTO);
        await this.chatsRepository.update(id, updateChat);
        return this.chatsRepository.findOneBy({chatId : id});

    }

    deletechat(id: string): Promise<DeleteResult> {
       return this.chatsRepository.delete(id);
    }

}