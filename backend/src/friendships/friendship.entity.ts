import { UserEntity } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('friendship')
export class FriendshipEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    user: UserEntity

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    friend: UserEntity

    @Column({default: false})
    isBlocked: boolean
}