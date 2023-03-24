export interface ChatRoom {
    id?: number
    name: string
    isPrivate?: boolean
}

export interface ChatMembership {
    id?: number
    isOwner: boolean
    isAdmin: boolean
    isBanned: boolean
    isMuted: boolean
}

export interface ChatMsg {
    id?: number
    content: string
    createdAt: Date
}