import { Exclude } from "class-transformer";
import { ChatMembershipEntity } from "src/chats2/chatEntities.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column ({ nullable: true }) 
    email: string

    @Exclude()
    @Column ({ nullable: true }) 
    password: string

    @Column({ nullable: true })
    login42: string

    @Column({ nullable: false, default: "Anonymous" })
    username: string

    @Exclude()
    @Column({ default: false })
    is2fa: boolean;

    @Exclude()
    @Column({ default: "", }) // si añado nullable: true después no TS me deja darle un valor
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

    @OneToMany(() => ChatMembershipEntity, membership => membership.chatRoom, { onDelete: 'CASCADE' })
    memberships: ChatMembershipEntity[];
}