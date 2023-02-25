import { IsUUID } from "class-validator";
import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    userId: string

    @Column({ nullable: false })
    login42: string

    @Column({ nullable: false, default: "Anonymous" })
    username: string

    @Column({ default: false })
    isTwofaEnabled: boolean;

    @Column(
        {
            // select: false, // no se selecciona en las queries a sql, por lo que no se muestra cuando devuelves el dto
            default: "",
        }) // si añado nullable: true después no TS me deja darle un valor
    twofaSecret: string

    @Column({ default: 0})
    victories: number;

    @Column({ default: 0})
    defeats: number;

    @Column({ default: ""})
    achievements: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}