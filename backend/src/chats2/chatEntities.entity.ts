import { UserEntity } from "src/users/user.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('chatRoom')
export class ChatRoomEntity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number    

    @Column({default: "unnamed"})
    name: string
    
    @ManyToOne(type => UserEntity)
    @JoinColumn()
    owner: UserEntity
    
    @Column({default: false})
    isPrivate: boolean

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
    isAdmin: boolean
    
    @Column({default: false})
    isBanned: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    bannedUntil: Date
    
    @Column({default: false})
    isMuted: boolean

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    mutedUntil: Date
}

@Entity('chatMsg')
export class ChatMsgEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => ChatRoomEntity)
    @JoinColumn()
    chatRoom: ChatRoomEntity
    
    @ManyToOne(type => ChatRoomEntity)
    @JoinColumn()
    sender: UserEntity

    @Column({default: ""})
    content: string
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}

@Entity('duologue')
export class DuologueEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    user1: UserEntity

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    user2: UserEntity
}


@Entity('directMsg')
export class DirectMsgEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(type => DuologueEntity)
    @JoinColumn()
    duologue: DuologueEntity

    @ManyToOne(type => UserEntity)
    @JoinColumn()
    sender: UserEntity

    @Column({default: ""})
    content: string
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date
}