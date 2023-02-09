import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { UserStats } from "src/user-stats/user-stats.interface";
import { UserStatsEntity } from "src/user-stats/user-stats.entity";

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
     chats:  [{name: string, role: string, isBanned: boolean, isMuted: boolean}];
 
     @Column({nullable: true})
     state:  string;

     @OneToOne(() => UserStatsEntity, userStats => userStats.user)
     @JoinColumn()
     userStats: UserStatsEntity;

     @ManyToMany(() => UserEntity, (friend) => friend.userId)
     friends: UserEntity;

    constructor(userId: string, name: string, password: string, email: string, chat: [{name: string, role: string, isBanned: boolean, isMuted: boolean}], state: string){
        this.userId = userId;
        this.username = name;
        this.password = password;
        this.email = email;
        this.chats = chat;
        this.state = state;
    }

}