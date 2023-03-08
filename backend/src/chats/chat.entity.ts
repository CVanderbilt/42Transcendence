// import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
// import { UserEntity } from "../users/user.entity"

// @Entity('chats')
// export class chatEntity {

//     @PrimaryGeneratedColumn("uuid")
//     readonly chatId: string;

//     @Column({
//         unique: true
//     })
//     readonly chatname: string;

//     @Column()
//     readonly password: string;

//     @Column({ type: "jsonb" })
//     readonly messages: string[];

//     @Column({ type: "jsonb", nullable: true })
//     readonly users: string[];





//     constructor(chatId: string, name: string, password: string, messages: string[], users: string[]) {
//         this.chatId = chatId;
//         this.chatname = name;
//         this.password = password;
//         this.messages = messages;
//         this.users = users
//     }

// }