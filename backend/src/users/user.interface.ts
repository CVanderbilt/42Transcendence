import { IsUUID } from "class-validator"

export class User {
    @IsUUID()
    userId?: string
    login42: string
    username: string
    isTwofaEnabled?: boolean
    twofaSecret?: string

    victories?: number
    defeats?: number
    achievements?: string
    createdAt?: Date
}