import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('chats')
export class chatEntity {

    @PrimaryGeneratedColumn("uuid")
    readonly chatId: string;

    @Column({
        unique: true
    })
    readonly chatname: string;

    @Column()
    readonly password: string;

    @Column({ type: "jsonb" })
    readonly messages: string[];

    constructor(chatId: string, name: string, password: string, messages: string[]) {
        this.chatId = chatId;
        this.chatname = name;
        this.password = password;
        this.messages = messages;
        console.log('Creo chat Entity para ' + this.chatname);
    }

}