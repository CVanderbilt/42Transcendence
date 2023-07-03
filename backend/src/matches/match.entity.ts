import { UserEntity } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('match')
export class MatchEntity extends BaseEntity{
    // @PrimaryGeneratedColumn()
    @PrimaryColumn()
    id: string

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    opponent: UserEntity

    @Column({ default: 0})
    userScore: number

    @Column({ default: 0})
    opponentScore: number

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    winner: UserEntity

    @Column({ default: "Exhibition"})
    type: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date
}
