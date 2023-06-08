import { UserEntity } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('match')
export class MatchEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: string

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity

    @ManyToOne(() => UserEntity)
    @JoinColumn()
    opponent: UserEntity

    @Column({ default: 0})
    playerScore: number

    @Column({ default: 0})
    opponentScore: number

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    winner: UserEntity

    @Column({ default: ""})
    powerups: string

    @Column({ default: "Pending opponent"})
    state: string

    @Column({ default: "Friendly"})
    type: string

    @Column({ default: false})
    isFinished: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date
}
