import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";


export class UserDTO {
    @ApiProperty()
    readonly userId?: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty()
    @IsEmail()
    readonly email: string;

    @ApiProperty()
    state:  string;

    victories: number
    defeats: number
    achievements: string
    createdAt?: Date
    isTwofaEnabled?: boolean
    twofaSecret?: string

    constructor(
        id: string, 
        username: string, 
        password: string, 
        email: string, 
        state:  string,
        victories: number,
        defeats: number,
        achievements: string,
        createdAt: Date,
        isTwofaEnabled: boolean,
        twofaSecret: string
        ) 
        {
        this.userId = id
        this.username = username
        this.password = password
        this.email = email
        this.state = state
        this.achievements = achievements
        this.createdAt = createdAt
        this.defeats = defeats
        this.victories = victories
        this.isTwofaEnabled = isTwofaEnabled
        this.twofaSecret = twofaSecret
    }
}