// import { Injectable } from "@nestjs/common";
// import { ChatDTO } from "./chat.dto";
// import { chatEntity } from "./chat.entity";

// @Injectable()
// export class chatMapper {

//     dtoToEntity(chatDTO: ChatDTO): chatEntity {
//         return new chatEntity(chatDTO.id, chatDTO.chatname, chatDTO.password, chatDTO.messages, chatDTO.users);
//     }

//     entityToDto(chatEntity: chatEntity): ChatDTO {
//         return new ChatDTO(chatEntity.chatId, chatEntity.chatname, chatEntity.password, chatEntity.messages, chatEntity.users);
//     }

// }