import { IsEmail, IsNotEmpty, MinLength } from "class-validator"
import { ChatMembership } from "src/chats2/chats.interface"

export class Login42dto {
    @IsNotEmpty()
    code: string
}

export class LoginResDto {
    userId: string
    login42: string
    name: string
    pic: string
    token: string
    is2fa: boolean
    chats: ChatMembership[]
}

export class Signin2faDto {
    twoFactorCode: string
}