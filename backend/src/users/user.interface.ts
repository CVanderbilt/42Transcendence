import { IsUUID } from "class-validator"
import { InsertWriteOpResult } from "typeorm"

export class User {
    @IsUUID()
    id?: string
    email?: string
    password?: string
    login42?: string
    username: string
    is2fa?: boolean
    twofaSecret?: string
    tentativeTwofaSecret?: string

    victories?: number
    defeats?: number
    achievements?: string
    position?: number

    createdAt?: Date

    image?: Uint8Array;
    isBanned: boolean;
    role: string;

    score?: number;
}