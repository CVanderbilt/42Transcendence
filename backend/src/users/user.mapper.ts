import { Injectable } from "@nestjs/common";
import { UserDTO } from "./user.dto";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserMapper {

    dtoToEntity(userDTO: UserDTO): UserEntity {
        return new UserEntity(userDTO.userId, userDTO.username, userDTO.password, userDTO.email, userDTO.state, userDTO.victories, userDTO.defeats, userDTO.achievements, userDTO.createdAt, userDTO.isTwofaEnabled, userDTO.twofaSecret);
    }

    entityToDto(userEntity: UserEntity): UserDTO {
        return new UserDTO(
            userEntity.userId,
            userEntity.username, 
            userEntity.password, 
            userEntity.email, 
            userEntity.state,
            userEntity.victories,
            userEntity.defeats,
            userEntity.achievements,
            userEntity.createdAt,
            userEntity.isTwofaEnabled,
            userEntity.twofaSecret);
    }

}