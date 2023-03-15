export interface ChatRoomDto {    
    name: string
    ownerId: string
    password?: string
    isPrivate?: boolean
    isDirect?: boolean
}

export interface ChatMembershipDto {
    userId: string
    chatRoomId: number
    isAdmin?: boolean
    isBanned?: boolean
    bannedUntil?: Date
    isMuted?: boolean
    mutedUntil?: Date
    chatRoomName?: string
    userName?: string
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