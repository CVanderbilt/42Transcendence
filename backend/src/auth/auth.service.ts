import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { UsersService } from 'src/users/users.service';
import { toFileStream } from 'qrcode';
import { LoginResDto, EmailSignupDto, LoginEmailDto } from './auth.dto';
import axios from 'axios';
import { User } from 'src/users/user.interface';
import * as bcrypt from 'bcrypt';
import { generateRandomSquaresImage, getAuthToken } from 'src/utils/utils';
const PNG = require('pngjs').PNG;


@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async getUserById(id: string) : Promise<User> {
        return await this.usersService.findOneById(id)
    }

    // LOGIN WITH EMAIL -------------------------------------------------------------------
    async registerWithEmail(data: EmailSignupDto) {
        // check if user exists
        const existingUser = await this.usersService.findByEmail(data.email)
        if (existingUser) {
            throw new HttpException("User already exists", HttpStatus.BAD_REQUEST)
        }

        // create user
        const saltOrRounds = 10;
        const hashed = await bcrypt.hash(data.password, saltOrRounds);
        var userDto: User = {
            email: data.email,
            username: data.username,
            password: hashed,
            isBanned: false,
            role: "CUSTOMER",
        }

        const user : User = await this.usersService.createUser(userDto)
        
        const png = generateRandomSquaresImage();
        const buffer = PNG.sync.write(png);
        await this.usersService.uploadDatabaseFile(buffer, user.id);
    }

    async loginWithEmail(login: LoginEmailDto) {
        if (login === undefined)
            throw new HttpException("INVALID_DATA", HttpStatus.BAD_REQUEST)

        const user : User = await this.usersService.findByEmail(login.email)
        if (!user) {
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
        }

        const passCheck = await bcrypt.compare(login.password, user.password)
        if (!passCheck) {
            throw new HttpException("INCORRECT_PASSWORD", HttpStatus.FORBIDDEN)
        }

        const pic : string = "" // TODO: get generic pic?
        
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        }

        const token = this.jwtService.sign(payload, { secret: process.env.JWT_KEY })
        const res : LoginResDto = {
            "userId": user.id,
            "email": user.email,
            "name": user.username,
            "pic": pic,
            "token": token,
            "is2fa": user.is2fa,
            "role": user.role,
        }

        return res
    }

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

    async exchange42TokenForUserData(token: string): Promise<any> {
        Logger.log("exchange42TokenForUserData")
        const res = axios({
            method: "get",
            url: "https://api.intra.42.fr/v2/me",
            headers: { Authorization: "Bearer " + token },
        })

        const data = (await res).data
        Logger.log(data)
        return data
    }
    

    async signIn42(code: string): Promise<LoginResDto> {
        const accessData = await this.exchangeCodeForAccessData(code)

        const me42 = await this.exchange42TokenForUserData(accessData.access_token)
        const name = me42.first_name + " " + me42.last_name
        const login42 = me42.login
        const pic = me42.image.link

        // get user
        var user: User = await this.usersService.findBy42Login(me42.login)
        if (!user) {
            // create user
            const newUserData: User = {
                login42: login42,
                username: name,
                isBanned: false,
                role: "CUSTOMER",
            }
            user = await this.usersService.createUser(newUserData)
        }

        const payload = {
            userId: user.id,
            accessData42: accessData,
        }

        const token = this.jwtService.sign(payload, { secret: process.env.JWT_KEY })
        const res : LoginResDto = {
            "userId": user.id,
            "login42": login42,
            "name": name,
            "pic": pic,
            "token": token,
            "is2fa": user.is2fa,
            "role": user.role,
        }

        return res
    }

    // 2FA ----------------------------------------
    public async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(user.login42, process.env.TFA_APP_NAME, secret);
        await this.usersService.setTwofaSecret(user.id, secret);

        return { secret, otpauthUrl }
    }

    public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl)
    }

    public async isTwoFactorAuthenticationCodeValid(userId: string, code: string) {
        const user = await this.usersService.findOneById(userId);
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
            isTwoFactorAuthenticationEnabled: !!foundUser.is2fa,
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
        const token = getAuthToken(req);
        if (token) {
            try {
                const user = await this.usersService.findOneById(token.userId);
                // const payload = await this.jwtService.verifyAsync(token, {
                //     secret: process.env.JWT_KEY,
                // });
                return user

            } catch (err) {
                console.log(err);
            }
        }
    }
}

