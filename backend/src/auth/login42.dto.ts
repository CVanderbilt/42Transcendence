import { IsEmail, IsNotEmpty, MinLength } from "class-validator"

export class Login42dto {
    @IsNotEmpty()
    code: string
}