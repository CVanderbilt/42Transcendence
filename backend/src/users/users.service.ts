import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from './user.interface';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>
    ) { }

    async createUser(user: User): Promise<User> {
        return this.usersRepo.save(user);
    }

    async findOneById(id: string): Promise<User> {
        return this.usersRepo.findOne( { where: { id: id } } )
    }

    async findByCredentials(login42: string): Promise<User> {
        Logger.log("inside findByCredentials")
        Logger.log(login42)
        return this.usersRepo.findOne( { where: { login42: login42 } } )
    }

    async checkpass(pass: string, encryptedPass: string): Promise<Boolean> {
        return await bcrypt.compare(pass, encryptedPass);
    }

    findAllUsers(): Promise<User[]> {
        return this.usersRepo.find();
    }

    updateUser(id: string, user: User): Promise<UpdateResult> {
        // No se puede activar 2FA sin validar el codigo de google authenticator
        if (user.is2fa === true)
            delete user.is2fa
        return this.usersRepo.update(id, user)
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
}
