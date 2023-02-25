import { IsEmail, IsNotEmpty, MinLength } from "class-validator"

export class Login42dto {
    @IsNotEmpty()
    code: string
}

export class Signin2faDto {
    login42: string
    twoFactorCode: string
}

export class MeDto {
    login42: string
    name: string
    photo_utl: string
}
