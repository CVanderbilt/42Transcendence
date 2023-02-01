import { GameEntity } from "src/games/game.entity";
import { UserEntity } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('match')
export class MatchEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    user: UserEntity

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    opponent: UserEntity

    @ManyToOne(type => GameEntity)
    @JoinColumn()
    game: GameEntity

    @Column({ default: 0})
    playerScore: number

    @Column({ default: 0})
    opponentScore: number

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    winner: UserEntity

    @Column({ default: ""})
    powerups: string

    @Column({ default: false})
    isFinished: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date
}
