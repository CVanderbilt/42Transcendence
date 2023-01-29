import { ApiProperty } from "@nestjs/swagger";

export class UserDTO {
    @ApiProperty()
    readonly id?: string;

    @ApiProperty()
    readonly username: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty()
    readonly email: string;

    constructor(id: string, username: string, password: string, email: string) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }
}