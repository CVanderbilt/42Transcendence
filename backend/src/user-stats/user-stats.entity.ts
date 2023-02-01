import { join } from "path";
import { UserEntity } from "src/users/user.entity";
import { UserDTO } from "src/users/user.dto";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('userStats')
export class UserStatsEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => UserEntity)
    @JoinColumn()
    user: UserEntity

    @Column({ default: 0})
    victories: number;

    @Column({ default: 0})
    defeats: number;

    @Column({ default: ""})
    achievements: string;
}