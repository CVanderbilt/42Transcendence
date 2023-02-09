import { Injectable } from '@nestjs/common';
import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';
import { UserMapper } from './user.mapper';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {

    constructor(
        private usersRepository: UsersRepository,
        private mapper: UserMapper
        ){}

    async getAllUsers(): Promise<UserDTO[]> {
        const users: UserEntity[] = await this.usersRepository.getAllUsers()
        return users.map(user => this.mapper.entityToDto(user));
    }

    async getUserById(id: string): Promise<UserDTO> {
        const user: UserEntity = await this.usersRepository.getUserById(id);
        return this.mapper.entityToDto(user);
    }

    async getUserByUsername(username: string): Promise<UserDTO> {
        const user: UserEntity = await this.usersRepository.getUserByUsername(username);
        return this.mapper.entityToDto(user);
    }

    async newUser(userDTO: UserDTO): Promise<UserDTO> {
        const newUser: UserEntity = await this.usersRepository.newUser(userDTO);
        return this.mapper.entityToDto(newUser);
    }

    async updateUser(id: string, userDTO: UserDTO): Promise<UserDTO> {
        const updateUser = await this.usersRepository.updateUser(id, userDTO);
        return this.mapper.entityToDto(updateUser);
    }

    async updateUserChats(id: string,  chat: {name: string, role: string, isBanned: boolean, isMuted: boolean}): Promise<UserDTO> {
        const updateUser = await this.usersRepository.updateUserChats(id, chat);
        return this.mapper.entityToDto(updateUser);
    }

    async getParticipants( chat: string): Promise<UserDTO[]> {
        const Users = await this.usersRepository.getParticipants(chat);
        let usersDTO: UserDTO[] = [];
        
        for(let i = 0; i < Users.length; i++){
            const userDTO = await this.mapper.entityToDto(Users[i]);
            usersDTO.push(userDTO);
        }
        return usersDTO;
    }

    async muteUser(id: string,  chat: {name: string}): Promise<UserDTO> {
        const updateUser = await this.usersRepository.muteUser(id, chat);
        return this.mapper.entityToDto(updateUser);
    }

    async deleteUser(id: string): Promise<void> {
        await this.usersRepository.deleteUser(id);
    }

}