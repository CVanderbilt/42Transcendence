import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class UserEntity {

    @PrimaryGeneratedColumn("uuid")
    readonly userId: string;

    @Column({
        unique: true
    })
    readonly username: string;

    @Column()
    readonly password: string;

    @Column()
    readonly email: string;

    constructor(userId: string, name: string, password: string, email: string) {
        this.userId = userId;
        this.username = name;
        this.password = password;
        this.email = email;
        console.log('Creo User Entity para ' + this.username);
    }

}