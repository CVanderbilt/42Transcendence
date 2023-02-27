import { IsUUID } from "class-validator"

export class User {
    @IsUUID()
    id?: string
    login42: string
    username: string
    is2fa?: boolean
    twofaSecret?: string

    victories?: number
    defeats?: number
    achievements?: string
    createdAt?: Date
}