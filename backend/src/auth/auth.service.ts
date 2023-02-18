import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
// import { User } from 'src/users/user.interface';
import { UsersService } from 'src/users/users.service';
import { toFileStream } from 'qrcode';
import { Signin2faDto } from './signin2fa.dto';
import { Login42dto } from './login42.dto';
import axios from 'axios';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // EMAIL AND PASSWORD ----------------------------------------
    // async registerWithEmail(user: SignupDto) {
    //     const saltOrRounds = 10;
    //     const hashed = await bcrypt.hash(user.pass, saltOrRounds);

    //     var userDTO: UserDTO = {
    //         email: user.email,
    //         name: user.name,
    //         pass: hashed,
    //     }

    //     return this.usersService.createUser(userDTO)
    // }


    // async signinWithEmail(login: SigninDto) {
    //     if (login === undefined)
    //         throw new HttpException("USER_NOT_FOUND", HttpStatus.BAD_REQUEST)

    //     const foundUser = await this.usersService.findByCredentials(login.email)
    //     if (!foundUser) {
    //         throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
    //     }

    //     const passCheck = await bcrypt.compare(login.pass, foundUser.pass)
    //     if (!passCheck) {
    //         throw new HttpException("INCORRECT_PASSWORD", HttpStatus.FORBIDDEN)
    //     }

    //     const payload = {
    //         email: foundUser.email,
    //     }

    //     const token = this.jwtService.sign(payload, { secret: process.env.JWT_KEY })

    //     return {
    //         email: foundUser.email,
    //         token: token,
    //     }
    // }

    // LOGIN WITH 42 -------------------------------------------------------------------

    async exchangeCodeForToken(code: string): Promise<string> {
        var bodyFormData = new FormData();
        bodyFormData.append("grant_type", "authorization_code");
        bodyFormData.append("client_id", "u-s4t2ud-8b7831bc16e1b149ccb268da713c3705b61d3f9728492946634a9ba532d731fe");
        bodyFormData.append("client_secret", "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");
        bodyFormData.append("code", code);
        bodyFormData.append("redirect_uri", "http://localhost:8080/login");

        var res = await axios({
            method: "post",
            url: "https://api.intra.42.fr/oauth/token",
            data: bodyFormData,
            headers: { "content-type": "application/x-www-form-urlencoded" },
        })

        return res.data.access_token
    }

    exchangeTokenForUserData(token: string) {
        return axios({
            method: "get",
            url: "https://api.intra.42.fr/v2/me",
            headers: { Authorization: "Bearer " + token },
        })
    }

    async signIn42(code: string): Promise<string> {
        Logger.log("code received = " + code)
        const token = await this.exchangeCodeForToken(code)
        const userData = await this.exchangeTokenForUserData(token)
        // guardar datos de usuarios 

        const payload = {
            userName: userData.data.login,
        }

        return this.jwtService.sign(payload, { secret: process.env.JWT_KEY })

    }

//     async login42(dto: Login42dto) {
//     Logger.log("code received = " + dto.code)

//     const bodyFormData = new FormData();
//     bodyFormData.append("grant_type", "authorization_code");
//     bodyFormData.append("client_id", process.env.ID_42);
//     bodyFormData.append("client_secret", process.env.SECRET_42);
//     bodyFormData.append("code", dto.code);
//     bodyFormData.append("redirect_uri", process.env.REDIRECT_URI);
//     const res = await axios.post('https://api.intra.42.fr/oauth/token', bodyFormData, {
//         headers: { "content-type": "application/x-www-form-urlencoded" }
//     });

//     Logger.log(res.status)

//     // var bodyFormData = new FormData();
//     // var response = axios({
//     //     method: "post",
//     //     url: "https://api.intra.42.fr/oauth/token",
//     //     data: bodyFormData,
//     //     headers: { "content-type": "application/x-www-form-urlencoded" },
//     // });


//     // // si no devuelve el token -> fallo
//     // if ((await response).data.access_token === undefined)
//     // {
//     // }
//     // // si hay token registra o actualiza al usuario


//     return "Procesado"
// }


//     // 2FA ----------------------------------------
//     public async generateTwoFactorAuthenticationSecret(user: User) {
//     const secret = authenticator.generateSecret();
//     const otpauthUrl = authenticator.keyuri(user.email, process.env.TFA_APP_NAME, secret);
//     await this.usersService.setTwofaSecret(user.userId, secret);

//     return { secret, otpauthUrl }
// }

//     public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
//     return toFileStream(stream, otpauthUrl)
// }

//     public async isTwoFactorAuthenticationCodeValid(dto: Signin2faDto) {
//     const user = await this.usersService.findByCredentials(dto.email)
//     const isCodeValid = authenticator.verify({
//         token: dto.twoFactorCode,
//         secret: user.twofaSecret,
//     })
//     return isCodeValid
// }

//     async loginWith2fa(dto: Signin2faDto) {
//     if (dto === undefined)
//         throw new HttpException("USER_NOT_FOUND", HttpStatus.BAD_REQUEST)

//     const foundUser = await this.usersService.findByCredentials(dto.email)
//     if (!foundUser) {
//         throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND)
//     }

//     const isCodeValid = await this.isTwoFactorAuthenticationCodeValid(dto)
//     if (!isCodeValid) {
//         throw new UnauthorizedException('Wrong authentication code');
//     }

//     const payload = {
//         email: dto.email,
//         name: foundUser.username,
//         isTwoFactorAuthenticationEnabled: !!foundUser.isTwofaEnabled,
//         isTwoFactorAuthenticated: true,
//     };

//     const data = {
//         email: dto.email,
//         token: this.jwtService.sign(payload, { secret: process.env.JWT_KEY }),
//     }

//     return data
// }


}

