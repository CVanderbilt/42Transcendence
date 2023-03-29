import { apiClient } from "./baseApi";

const URL = "/matches";

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


export async function enterCompetitiveGameApi(userId: string) {
    return apiClient.get(`${URL}/competitiveMatch/${userId}`)
}

export async function getGameApi(matchId: string) {
    return apiClient.get(`${URL}/${matchId}`)
}

export async function getPlayerOneApi(matchId: string) {
    return apiClient.get(`${URL}/playerOne/${matchId}`)
}

export async function getPlayerTwoApi(matchId: string) {
    return apiClient.get(`${URL}/playerTwo/${matchId}`)
}