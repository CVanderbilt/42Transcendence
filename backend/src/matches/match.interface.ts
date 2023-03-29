export interface Match {
    id?: string
    playerScore: number
    opponentScore: number
    powerups: string
    state: string
    type: string
    isFinished: boolean
    createdAt?: Date;
}