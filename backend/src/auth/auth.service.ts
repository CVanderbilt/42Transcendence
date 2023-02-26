import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { UsersService } from 'src/users/users.service';
import { toFileStream } from 'qrcode';
import { LoginResDto, Signin2faDto } from './auth.dto';
import axios from 'axios';
import { User } from 'src/users/user.interface';
import { ChatMembership, ChatRoom } from 'src/chats2/chats.interface';
import { ChatMembershipDto, ChatRoomDto } from 'src/chats2/chats.dto';
import { Chats2Service } from 'src/chats2/chats2.service';
import { ChatMembershipEntity } from 'src/chats2/chatEntities.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly chats2Service: Chats2Service,
        private jwtService: JwtService,
    ) { }

    // LOGIN WITH 42 -------------------------------------------------------------------

    async exchangeCodeForAccessData(code: string): Promise<any> {
        var bodyFormData = new FormData();
        bodyFormData.append("grant_type", "authorization_code");
        bodyFormData.append("client_id", process.env.ID_42);
        bodyFormData.append("client_secret", process.env.SECRET_42);
        bodyFormData.append("code", code);
        bodyFormData.append("redirect_uri", process.env.REDIRECT_URI);

        try {
            const res = axios({
                method: "post",
                url: "https://api.intra.42.fr/oauth/token",
                data: bodyFormData,
                headers: { "content-type": "application/json" },
            })
    
            const data = (await res).data
    
            return data
        } catch (error) {
            Logger.error("Failed getting token from 42: " + error)            
        }
        
    }

    async exchangeTokenForUserData(token: string): Promise<any> {
        const res = axios({
            method: "get",
            url: "https://api.intra.42.fr/v2/me",
            headers: { Authorization: "Bearer " + token },
        })

        return (await res).data
    }
    
    async joinUser2GeneralChat(userId : string)
    {
        var generalChat : ChatRoom = await this.chats2Service.findChatRoomByName(process.env.GENERAL_CHAT_NAME)
        if (!generalChat)
        {
            const generalChatRoomDto : ChatRoomDto = {
                name: process.env.GENERAL_CHAT_NAME,
                ownerId: userId,
                isPrivate: false,
                password: "",
            }
            generalChat = await this.chats2Service.createChatRoom(generalChatRoomDto)            
        }
        Logger.log({generalChat})
        const membership : ChatMembershipDto = {
            userId: userId,
            chatRoomId: generalChat.id,
            isAdmin: false,
        }            
        this.chats2Service.joinChatRoom(generalChat.id, membership)
    }

    async signIn42(code: string): Promise<LoginResDto> {
        const accessData = await this.exchangeCodeForAccessData(code)

        Logger.log({accessData})
        const me42 = await this.exchangeTokenForUserData(accessData.access_token)
        const name = me42.first_name + " " + me42.last_name
        const login42 = me42.login
        const pic = me42.image.link

        // get user
        var user: User = await this.usersService.findByCredentials(me42.login)
        if (!user) {
            // create user
            Logger.log("creating user")
            const newUserData: User = {
                login42: login42,
                username: name,
            }
            user = await this.usersService.createUser(newUserData)
        }

        this.joinUser2GeneralChat(user.userId)
        const chats : ChatMembership[] = await this.chats2Service.findUserMemberships(user.userId)

        const payload = {
            userId: user.userId,
            accessData42: accessData,
        }

        const token = this.jwtService.sign(payload, { secret: process.env.JWT_KEY })
        const res : LoginResDto = {
            "login42": login42,
            "name": name,
            "pic": pic,
            "token": token,
            "is2fa": user.isTwofaEnabled,
            "chats": chats
        }
        return res
    }

    // 2FA ----------------------------------------
    public async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.login42, process.env.TFA_APP_NAME, secret);
        await this.usersService.setTwofaSecret(user.userId, secret);

        return { secret, otpauthUrl }
    }

    public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl)
    }

    public async isTwoFactorAuthenticationCodeValid(userId: string, code: string) {
        const user = await this.usersService.findOneById(userId);
        Logger.log(user.login42 + " " + user.twofaSecret)
        const isCodeValid = authenticator.verify({
            token: code,
            secret: user.twofaSecret,
        })
        return isCodeValid
    }

    async loginWith2fa(userId: string, code: string) {
        if (userId === undefined)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.BAD_REQUEST)

        const foundUser = await this.usersService.findOneById(userId)
        if (!foundUser) {
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        }

        const isCodeValid = await this.isTwoFactorAuthenticationCodeValid(userId, code)
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }

        const payload = {
            login42: foundUser.login42,
            name: foundUser.username,
            isTwoFactorAuthenticationEnabled: !!foundUser.isTwofaEnabled,
            isTwoFactorAuthenticated: true,
        };

        const data = {
            login42: foundUser.login42,
            token: this.jwtService.sign(payload, { secret: process.env.JWT_KEY }),
        }

        return data
    }

    // --------------------------------------------

    async me(req : any) : Promise<any>{
        Logger.log("me")
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            try {
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: process.env.JWT_KEY,
                });
                Logger.log("Token payload:")
                Logger.log({ payload })
                return payload

            } catch (err) {
                console.log(err);
            }
        }
    }
}

