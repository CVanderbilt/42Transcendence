import { IsEmail, IsNotEmpty, MinLength } from "class-validator"

export class EmailSignupDto {
    @IsEmail()
    email: string
    @IsNotEmpty()
    @MinLength(8)
    password: string
    @IsNotEmpty()
    username: string
}

export class LoginEmailDto {
    @IsEmail()
    email: string
    @IsNotEmpty()
    @MinLength(8)
    password: string
}

export class Login42dto {
    @IsNotEmpty()
    code: string
}

export class LoginResDto {
    userId: string
    login42?: string
    email?: string
    name: string
    token: string
    is2fa: boolean
    role: string
    isNew?: boolean
}

export class Signin2faDto {
    @IsNotEmpty()
    twoFactorCode: string
}