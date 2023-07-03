export interface MatchDto {
    id: string
    user: string
    opponent: string
    playerScore: number
    opponentScore: number
    winner?: string
    powerups?: string
    state?: string
    type?: string
    isFinished: boolean
    createdAt: Date
}