import { UserEntity } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity('chatRoom')
export class ChatRoomEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number    

    @Column({default: "unnamed"})
    name: string
    
    @Column({default: false})
    isPrivate: boolean

    @Column({default: false})
    isDirect: boolean

    // por si no funciona con null 
    // // is password protected   
    // @Column({default: false})
    // isPasswordProtected: boolean

    @Column({default: null})
    password: string

    @OneToMany(() => ChatMembershipEntity, membership => membership.chatRoom, { onDelete: 'CASCADE'})
    memberships: ChatMembershipEntity[];

    @OneToMany(() => ChatMsgEntity, message => message.chatRoom, { onDelete: 'CASCADE' })
    messages: ChatMsgEntity[];
}

@Entity('chatMembership')
export class ChatMembershipEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number    

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    user: UserEntity

    @ManyToOne(type => ChatRoomEntity)
    @JoinColumn()
    chatRoom: ChatRoomEntity

    @Column({default: false})
    isOwner: boolean

    @Column({default: false})
    isAdmin: boolean

    @Column({default: false})
    isBanned: boolean
    
    @Column({default: false})
    isMuted: boolean

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    bannedUntil: Date

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    mutedUntil: Date
}

@Entity('chatMsg')
export class ChatMsgEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => ChatRoomEntity)
    @JoinColumn()
    chatRoom: ChatRoomEntity
    
    @ManyToOne(type => UserEntity)
    @JoinColumn()
    sender: UserEntity

    @Column({default: ""})
    content: string
    
    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}
