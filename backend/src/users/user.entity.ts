import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column ({ nullable: true }) 
    email: string

    @Column ({ nullable: true }) 
    password: string

    @Column({ nullable: true })
    login42: string

    @Column({ nullable: false, default: "Anonymous" })
    username: string

    @Column({ default: false })
    is2fa: boolean;

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

    @Column({ type: 'bytea', nullable: true })
    image: Uint8Array;

    @Column({ default: false })
    isBanned: boolean;

    @Column({ nullable: false, default: "CUSTOMER" })
    role: string;
}