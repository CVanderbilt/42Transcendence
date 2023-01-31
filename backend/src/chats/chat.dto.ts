import { ApiProperty } from "@nestjs/swagger";

export class ChatDTO {
    @ApiProperty()
    readonly id?: string;

    @ApiProperty()
    readonly chatname: string;

    @ApiProperty()
    readonly password: string;

    @ApiProperty()
    readonly messages: string[];
    



    constructor(id: string, chatname: string, password: string, messages: string[]) {
        this.id = id;
        this.chatname = chatname;
        this.password = password;
        this.messages = messages;
    }
}