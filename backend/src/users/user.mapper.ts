import { Injectable } from "@nestjs/common";
import { UserDTO } from "./user.dto";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserMapper {

    dtoToEntity(userDTO: UserDTO): UserEntity {
        return new UserEntity(userDTO.id, userDTO.username, userDTO.password, userDTO.email, userDTO.chats);
    }

    entityToDto(userEntity: UserEntity): UserDTO {
        return new UserDTO(userEntity.id, userEntity.username, userEntity.password, userEntity.email, userEntity.chats);
    }

}