import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
     chats:  [{name: string}];

    constructor(userId: string, name: string, password: string, email: string, chat:  [{name: string}] ){
        this.userId = userId;
        this.username = name;
        this.password = password;
        this.email = email;
        this.chats = chat;
        console.log('Creo User Entity para ' + this.username);
    }

}