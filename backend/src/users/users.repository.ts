
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
        const updateUserDTO: UserDTO = new UserDTO(id, userDTO.username, userDTO.password, userDTO.email, userDTO.chats, userDTO.state);
        const updateUser = this.mapper.dtoToEntity(updateUserDTO);
        await this.usersRepository.update(id, updateUser);
        return this.usersRepository.findOneBy({userId : id});

    }

    async updateUserChats(id: string, chat: {name: string, role: string, isBanned: boolean, isMuted: boolean }): Promise<UserEntity> {
        
        const updateUser = await this.usersRepository.findOneBy({userId : id});
        console.log(updateUser.chats)
        updateUser.chats.push(chat)
        await this.usersRepository.update(id, updateUser);
        return this.usersRepository.findOneBy({userId : id});

    }

    async muteUser(id: string, chat: {name: string}): Promise<UserEntity> {
        
        const updateUser = await this.usersRepository.findOneBy({userId : id});
        updateUser.chats[updateUser.chats.indexOf(updateUser.chats.find((str) => str.name === chat.name))].isMuted = true
        await this.usersRepository.update(id, updateUser);
        return this.usersRepository.findOneBy({userId : id});

    }

    async getParticipants(chat: string): Promise<UserEntity[]> {
        const users = await this.usersRepository.find({where: {
            chats: {
                name: "general"
            }
        }})
        //esto no funciona
    
        return users;
    }

    deleteUser(id: string): Promise<DeleteResult> {
       return this.usersRepository.delete(id);
    }

}