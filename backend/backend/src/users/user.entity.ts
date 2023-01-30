import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import{ Chat} from "../chats/chat.interface"

@Entity('users')
export class UserEntity {

    @PrimaryGeneratedColumn("uuid")
    readonly userId: string;

    @Column({
        unique: true
    })
    username: string;

    @Column()
    readonly password: string;

    @Column()
    readonly email: string;

    @Column({ type: "jsonb" })
     chats:  string[];

    constructor(userId: string, name: string, password: string, email: string, chat:  string[]) {
        this.userId = userId;
        this.username = name;
        this.password = password;
        this.email = email;
        this.chats = chat;
        console.log('Creo User Entity para ' + this.username);
    }

}