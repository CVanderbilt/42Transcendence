import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { UsersService } from 'src/users/users.service';
import { toFileStream } from 'qrcode';
import { MeDto, Signin2faDto } from './auth.dto';
import axios from 'axios';
import { User } from 'src/users/user.interface';
import { Console } from 'console';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // LOGIN WITH 42 -------------------------------------------------------------------

    async exchangeCodeForAccessData(code: string): Promise<any> {
        Logger.log("usando code: " + code)

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
    
            Logger.log("respuesta de 42 oauth token:")
            Logger.log({data})
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

    async signIn42(code: string): Promise<any> {
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
        Logger.log({ user })

        const payload = {
            userId: user.userId,
            accessData42: accessData,
        }

        const token = this.jwtService.sign(payload, { secret: process.env.JWT_KEY })

        const res = {
            "login42": login42,
            "name": name,
            "pic": pic,
            "token": token,
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

    public async isTwoFactorAuthenticationCodeValid(dto: Signin2faDto) {
        const user = await this.usersService.findByCredentials(dto.login42)
        const isCodeValid = authenticator.verify({
            token: dto.twoFactorCode,
            secret: user.twofaSecret,
        })
        return isCodeValid
    }

    async loginWith2fa(dto: Signin2faDto) {
        if (dto === undefined)
            throw new HttpException("USER_NOT_FOUND", HttpStatus.BAD_REQUEST)

        const foundUser = await this.usersService.findByCredentials(dto.login42)
        if (!foundUser) {
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        }

        const isCodeValid = await this.isTwoFactorAuthenticationCodeValid(dto)
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }

        const payload = {
            login42: dto.login42,
            name: foundUser.username,
            isTwoFactorAuthenticationEnabled: !!foundUser.isTwofaEnabled,
            isTwoFactorAuthenticated: true,
        };

        const data = {
            login42: dto.login42,
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

