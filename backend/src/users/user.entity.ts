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
    password: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    state: string;

    @Column({ default: 0})
    victories: number;

    @Column({ default: 0})
    defeats: number;

    @Column({ default: ""})
    achievements: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ default: false })
    isTwofaEnabled: boolean;

    @Column(
        {
            // select: false, // no se selecciona en las queries a sql, por lo que no se muestra cuando devuelves el dto
            default: "",
        }) // si añado nullable: true después no TS me deja darle un valor
    twofaSecret: string    

    constructor(userId: string, name: string, password: string, email: string, state: string, victories: number, defeats: number, achievements: string, createdAt: Date, isTwofaEnabled: boolean, twofaSecret: string) {
        this.userId = userId;
        this.username = name;
        this.password = password;
        this.email = email;
        this.state = state;
        this.victories = victories;
        this.defeats = defeats;
        this.achievements = achievements;
        this.createdAt = createdAt;
        this.isTwofaEnabled = isTwofaEnabled;
        this.twofaSecret = twofaSecret;   
    }

}