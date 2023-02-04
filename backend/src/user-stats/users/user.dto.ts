import { ApiProperty } from "@nestjs/swagger";

export class UserDTO {
    @ApiProperty()
    readonly id?: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    chats:  [{name: string}];

    constructor(id: string, username: string, password: string, email: string, chats: [{name: string}]) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.chats = chats;
    }
}