import { ApiProperty } from "@nestjs/swagger";
import { chatEntity } from "src/chats/chat.entity";


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
    chats:  [{name: string, role: string, isBanned: boolean, isMuted: boolean}];

    @ApiProperty()
    state:  string;

    constructor(id: string, username: string, password: string, email: string, chats: [{name: string, role: string, isBanned: boolean, isMuted: boolean}], state:  string) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.chats = chats;
        this.state = state
    }
}