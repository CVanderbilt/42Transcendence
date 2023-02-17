export interface ChatRoom {
    id?: number
    name: string
    isPrivate: boolean
}

export interface ChatMembership {
    id?: number
    isAdmin: boolean
    isBanned: boolean
    bannedUntil: Date
    isMuted: boolean
    mutedUntil: Date
}

export interface ChatMsg {
    id?: number
    content: string
    createdAt: Date
}

export interface Duologue {
    id?: number
}

export interface DirectMsg {
    id?: number
    content: string
    createdAt: Date
}