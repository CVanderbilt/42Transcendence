
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class UsersRepository {

    constructor(
        @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
        private mapper: UserMapper){}

    getAllUsers(): Promise<UserEntity[]> {
        return this.usersRepository.find();
    }

    getUserById(id: string): Promise<UserEntity> {
        return this.usersRepository.findOneBy({id : id});
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
        return this.usersRepository.findOneBy({id : id});

    }

    async updateUserChats(id: string, chat: {name: string}): Promise<UserEntity> {
        
        const updateUser = await this.usersRepository.findOneBy({id : id});

        console.log("QUE AÑADO ESTO: " + chat.name)
        updateUser.chats.push(chat)
        await this.usersRepository.update(id, updateUser);
        return this.usersRepository.findOneBy({id : id});

    }

    deleteUser(id: string): Promise<DeleteResult> {
       return this.usersRepository.delete(id);
    }

}