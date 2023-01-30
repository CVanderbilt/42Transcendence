import { ApiProperty } from "@nestjs/swagger";
import{ Chat} from "../chats/chat.interface"

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
    chats:  string[];

    constructor(id: string, username: string, password: string, email: string, chats:  string[]) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.chats = chats;
    }
}