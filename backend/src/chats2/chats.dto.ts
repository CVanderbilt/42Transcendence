export interface ChatRoomDto {    
    name: string
    ownerId: string
    password?: string
    isPrivate?: boolean
}

export interface ChatMembershipDto {
    userId: string
    chatRoomId: number
    isAdmin?: boolean
    isBanned?: boolean
    bannedUntil?: Date
    isMuted?: boolean
    mutedUntil?: Date
}

export interface ChatMsgDto {
    senderId: string
    chatRoomId: number
    content: string
    senderName?: string
    createdAt?: Date
}

export interface DirectMsgDto {
    duologueId: number
    senderId: string
    content: string
}

export interface DuologueDto {
    duologueId: number
    user1Id: string
    user2Id: string
}

export interface JoinChatRoomDto {
    userId: string
    password?: string
}