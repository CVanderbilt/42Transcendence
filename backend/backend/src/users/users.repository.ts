
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';
import{ Chat} from "../chats/chat.interface"

@Injectable()
export class UsersRepository {

    constructor(
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
        private mapper: UserMapper){}

    getAllUsers(): Promise<UserEntity[]> {
        return this.usersRepository.find();
    }

    getUserById(id: string): Promise<UserEntity> {
        return this.usersRepository.findOneBy({userId : id});
    }

    getUserByUsername(username: string): Promise<UserEntity> {
        return this.usersRepository.findOneBy({username : username});
    }

    async newUser(userDTO: UserDTO): Promise<UserEntity> {
        const newUser = this.mapper.dtoToEntity(userDTO);
        return this.usersRepository.save(newUser);
    }

    async updateUser(id: string, userDTO: UserDTO): Promise<UserEntity> {
        const updateUserDTO: UserDTO = new UserDTO(id, userDTO.username, userDTO.password, userDTO.email, userDTO.chats);
        const updateUser = this.mapper.dtoToEntity(updateUserDTO);
        await this.usersRepository.update(id, updateUser);
        return this.usersRepository.findOneBy({userId : id});

    }

    async updateUserChats(id: string, chats: string[]): Promise<UserEntity> {
        
        const updateUser = await this.usersRepository.findOneBy({userId : id});
        updateUser.chats = chats
        await this.usersRepository.update(id, updateUser);
        return this.usersRepository.findOneBy({userId : id});

    }

    deleteUser(id: string): Promise<DeleteResult> {
       return this.usersRepository.delete(id);
    }

}