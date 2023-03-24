import { UserEntity } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
}

@Entity('chatMembership')
export class ChatMembershipEntity extends BaseEntity{
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
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}
