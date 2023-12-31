import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from './user.entity';
import { User } from './user.interface';
import * as bcrypt from 'bcrypt';
import { Chats2Service } from 'src/chats2/chats2.service';
import { addToBlacklist } from 'src/utils/utils';

@Injectable()
export class UsersService {
    constructor(
        private readonly chatsService: Chats2Service,
        @InjectRepository(UserEntity)
        private readonly usersRepo: Repository<UserEntity>,
    ) { }

    async createUser(user: User, join2general = true): Promise<User> {
        user.is2fa = false;
        const newUser = this.usersRepo.save(user)
        if (join2general)
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

    async checkEncrypted(pass: string, encryptedPass: string): Promise<Boolean> {
        return await bcrypt.compare(pass, encryptedPass);
    }

    findAllUsers(): Promise<User[]> {
        return this.usersRepo.find();
    }

    async updateUser(id: string, user: User): Promise<UpdateResult> {
        const storedUser = await this.findOneById(id)

        if (storedUser.username !== user.username) {
            const userWithSameUsername = await this.findOneByName(user.username)
            if (userWithSameUsername && userWithSameUsername.id !== id)
                throw new HttpException("USERNAME_ALREADY_EXISTS", HttpStatus.CONFLICT)
        }
        
        const updatedUser = Object.assign({}, storedUser, user)

        return this.usersRepo.update(id, updatedUser)
    }

    deleteUser(id: string): Promise<DeleteResult> {
        return this.usersRepo.delete(id);
    }

    async EnableTwofa(userId: string) {
        console.log("EnableTwofa", userId)
        const u = await this.usersRepo.findOne({ 
            where: { id: userId },
            select: ["id", "tentativeTwofaSecret"] })
        u.is2fa = true
        u.twofaSecret = u.tentativeTwofaSecret
        u.tentativeTwofaSecret = ""
        u.save()
        return u.is2fa
    }

    async setTentativeTwofaSecret(userId: string, secret: string) {
        const user = await this.usersRepo.findOne({ 
            where: { id: userId },
            select: ["id", "tentativeTwofaSecret"] })

        if (!user)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        user.tentativeTwofaSecret = secret
        await user.save()
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
            return new HttpException("User not found", HttpStatus.NOT_FOUND)
        if (this.isOwner(user))
            return new HttpException("Cant ban owner", HttpStatus.FORBIDDEN)
        user.isBanned = isBanned;
        user.save();
        addToBlacklist(user.id)
    }

    async setUserAsAdmin(id: string) {
        console.log("setUserAsAdmin", id)
        const user = await this.usersRepo.findOneBy({ id })
        if (!user)
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        if (user.isBanned)
            throw new HttpException("A banned user cant be admin", HttpStatus.CONFLICT)
        if (this.isOwner(user))
            throw new HttpException("Cant set owner as admin", HttpStatus.FORBIDDEN)
        user.role = "ADMIN";
        user.save();
        addToBlacklist(user.id)
    }

    async setUserAsCustomer(id: string) {
        const user = await this.usersRepo.findOneBy({ id })
        if (!user)
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        if (this.isOwner(user))
            throw new HttpException("Cant set owner as customer", HttpStatus.FORBIDDEN)
        user.role = "CUSTOMER";
        user.save();
        addToBlacklist(user.id)
    }

    isOwner(user: UserEntity | User) { return user.role === "OWNER" }
    isAdmin(user: UserEntity | User) { return user.role === "ADMIN" }

    async getLadder() : Promise<User[]> {
        const topUsers = await this.usersRepo.find({
            order: {
              score: "DESC"
            },
            take: 50 // Retrieve up to 50 users
          });
        
          return topUsers;
    }
}
