// import { Injectable } from '@nestjs/common';
// import { ChatDTO } from './chat.dto';
// import { chatEntity } from './chat.entity';
// import { chatMapper } from './chat.mapper';
// import { chatsRepository } from './chats.repository';

// @Injectable()
// export class chatsService {

//     constructor(
//         private chatsRepository: chatsRepository,
//         private mapper: chatMapper
//         ){}

//     async getAllchats(): Promise<ChatDTO[]> {
//         const chats: chatEntity[] = await this.chatsRepository.getAllchats()
//         return chats.map(chat => this.mapper.entityToDto(chat));
//     }

//     async getchatById(id: string): Promise<ChatDTO> {
//         const chat: chatEntity = await this.chatsRepository.getchatById(id);
//         return this.mapper.entityToDto(chat);
//     }

//     async getchatBychatname(chatname: string): Promise<ChatDTO> {
//         const chat: chatEntity = await this.chatsRepository.getchatBychatname(chatname);
//         return this.mapper.entityToDto(chat);
//     }

//     async newchat(chatDTO: ChatDTO): Promise<ChatDTO> {
//         const newchat: chatEntity = await this.chatsRepository.newchat(chatDTO);
//         return this.mapper.entityToDto(newchat);
//     }

//     async updatechat(id: string, chatDTO: ChatDTO): Promise<ChatDTO> {
//         const updatechat = await this.chatsRepository.updatechat(id, chatDTO);
//         return this.mapper.entityToDto(updatechat);
//     }

//     async deletechat(id: string): Promise<void> {
//         await this.chatsRepository.deletechat(id);
//     }

// }