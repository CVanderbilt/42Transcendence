import { IsUUID } from "class-validator"

export class User {
    @IsUUID()
    id?: string
    email?: string
    password?: string
    login42?: string
    username: string
    is2fa?: boolean
    twofaSecret?: string

    victories?: number
    defeats?: number
    achievements?: string
    createdAt?: Date

    image?: Uint8Array;
    isBanned: boolean;
}