import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from './user.interface';
import * as bcrypt from 'bcrypt';
import { Chats2Service } from 'src/chats2/chats2.service';
import * as joi from 'joi'

@Injectable()
export class UsersService {
    constructor(
        private readonly chatsService: Chats2Service,
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>
    ) { }

    async createUser(user: User): Promise<User> {
        user.is2fa = false;
        const newUser = this.usersRepo.save(user)
        this.chatsService.joinUser2GeneralChat(user.id)
        return newUser
    }

    async findOneById(id: string): Promise<User> {
        return this.usersRepo.findOne( { where: { id: id } } )
    }

    async findOneByName(username: string): Promise<User> {
        return this.usersRepo.findOne( { where: { username: username } } )
    }

    async findBy42Login(login42: string): Promise<User> {
        return this.usersRepo.findOne( { where: { login42: login42 } } )
    }

    async findByEmail(email: string): Promise<User> {
        return this.usersRepo.findOne( { where: { email: email } } )
    }

    async checkpass(pass: string, encryptedPass: string): Promise<Boolean> {
        return await bcrypt.compare(pass, encryptedPass);
    }

    findAllUsers(): Promise<User[]> {
        return this.usersRepo.find();
    }

    async updateUser(id: string, user: User): Promise<UpdateResult> {
        // No se puede activar 2FA sin validar el codigo de google authenticator
        //if (user.is2fa === true)
        //    delete user.is2fa
        //user.id = undefined;

        const storedUser = await this.findOneById(id)

        // esto lo que hace es crear un updatedUser con los valores de user (parametro) y todos los miembros
        //  de user que sean undefined mantendrán el valor de storedUser, es decir, el valor que había ya en la base de datos
        const updatedUser = Object.assign({}, storedUser, user)

        return this.usersRepo.update(id, updatedUser)
    }

    deleteUser(id: string): Promise<DeleteResult> {
        return this.usersRepo.delete(id);
    }

    async EnableTwofa(login42: string, value: boolean) {
        const u = await this.usersRepo.findOneBy({ login42 : login42 })
        u.is2fa = value
        u.save()
        return u.is2fa
    }

    async setTwofaSecret(userId: string, secret: string) {
        const user = await this.usersRepo.findOneBy({ id : userId })
        user.twofaSecret = secret
        user.save()
    }

    async getFileById(id: string) {
        const user = await this.findOneById(id)
        if (user)
            return user.image
        return null;
    }

    async uploadDatabaseFile(dataBuffer: Buffer, id: string) {
        const user = await this.usersRepo.findOneBy({ id: id })
        user.image = dataBuffer;
        user.save();
    }
}
