export interface Match {
    id?: number
    playerScore: number
    opponentScore: number
    powerups: string
    isFinished: boolean
    createdAt?: Date;
}