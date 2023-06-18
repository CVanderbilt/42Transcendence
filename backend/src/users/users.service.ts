import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from './user.interface';
import * as bcrypt from 'bcrypt';
import { Chats2Service } from 'src/chats2/chats2.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly chatsService: Chats2Service,
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
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
        console.log("findOneByName", username)
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

        if (storedUser.username !== user.username) {
            const userWithSameUsername = await this.findOneByName(user.username)
            if (userWithSameUsername && userWithSameUsername.id !== id)
                throw new HttpException("USERNAME_ALREADY_EXISTS", HttpStatus.CONFLICT)
        }

        // esto lo que hace es crear un updatedUser con los valores de user (parametro) y todos los miembros
        //  de user que sean undefined mantendrán el valor de storedUser, es decir, el valor que había ya en la base de datos
        const updatedUser = Object.assign({}, storedUser, user)

        return this.usersRepo.update(id, updatedUser)
    }

    deleteUser(id: string): Promise<DeleteResult> {
        return this.usersRepo.delete(id);
    }

    async EnableTwofa(userId: string, value: boolean) {
        const u = await this.usersRepo.findOneBy({ id : userId })
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
        if (!user)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        user.image = dataBuffer;
        user.save();
    }

    async setUserIsBanned(id: string, isBanned: boolean) {
        const user = await this.usersRepo.findOneBy({ id: id })
        if (!user)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        if (this.isAdmin(user) || this.isOwner(user))
            throw new HttpException("CANT_BAN_PRIVILEGED_USERS", HttpStatus.FORBIDDEN)
        user.isBanned = isBanned;
        user.save();
    }

    async setUserAsAdmin(id: string) {
        const user = await this.usersRepo.findOneBy({ id })
        if (!user)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        if (this.isOwner(user))
            throw new HttpException("CANT_SET_OWNER_AS_ADMIN", HttpStatus.FORBIDDEN)
        user.role = "ADMIN";
        user.save();
    }

    async setUserAsCustomer(id: string) {
        const user = await this.usersRepo.findOneBy({ id })
        if (!user)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        if (this.isOwner(user))
            throw new HttpException("CANT_SET_OWNER_AS_CUSTOMER", HttpStatus.FORBIDDEN)
        user.role = "CUSTOMER";
        user.save();
    }

    async setUserAsOwner(id: string, previousOwnerId: string) {
        const user = await this.usersRepo.findOneBy({ id })
        const previousOwner = await this.usersRepo.findOneBy({ id: previousOwnerId })

        if (!user)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        if (this.isOwner(previousOwner))
            throw new HttpException("ONLY_OWNER_CAN_CHANGE_OWNERSHIP", HttpStatus.FORBIDDEN);

        user.role = "OWNER"
        previousOwner.role = "ADMIN"

        user.save();
        previousOwner.save();
    }

    isOwner(user: UserEntity | User) { return user.role === "OWNER" }
    isAdmin(user: UserEntity | User) { return user.role === "ADMIN" }

    async getLadder() : Promise<User[]> {
        console.log("getLadder")
        const users = await this.usersRepo.find()
        users.sort((u1, u2) => {
            // if player has not played any game, he is last
            if (u1.victories + u1.defeats === 0)
                return 1;
            if (u2.victories + u2.defeats === 0)
                return -1;    
            // Order by ratio
            if (u1.victories / (u1.victories + u1.defeats) < u2.victories / (u2.victories + u2.defeats))
                return 1;
            if (u1.victories / (u1.victories + u1.defeats) > u2.victories / (u2.victories + u2.defeats))
                return -1;
            // Order by victories
            if (u1.victories < u2.victories)
                return 1;
            if (u1.victories > u2.victories)
                return -1;
            return 0;
        })
        return users
    }
}
