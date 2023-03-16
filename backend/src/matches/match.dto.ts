export interface MatchDto {
    id: number
    user: string
    opponent: string
    game?: string
    playerScore: number
    opponentScore: number
    winner?: string
    powerups?: string
    isFinished: boolean
    createdAt: Date
}