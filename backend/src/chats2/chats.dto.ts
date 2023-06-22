export interface ChatRoomDto {    
    name: string
    password?: string
    isPrivate?: boolean
    isDirect?: boolean
}

export interface ChatMembershipDto {
    [x: string]: any
    userId: string
    chatRoomId: number
    isOwner?: boolean
    isAdmin?: boolean
    isBanned?: boolean
    isMuted?: boolean
    bannedUntil?: Date
    mutedUntil?: Date
}

export interface ChatMsgDto {
    senderId: string
    chatRoomId: number
    content: string
    senderName?: string
    createdAt?: Date
}

export interface JoinChatRoomDto {
    userId: string
    password?: string
}