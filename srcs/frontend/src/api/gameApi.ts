import { apiClient } from "./baseApi";
import { IUserAPI } from "./user";

const URL = "/matches";

export interface Match {
    id?: string
    userScore: number
    opponentScore: number
    powerups: string
    state: string
    type: string
    isFinished: boolean
    createdAt?: Date;
    opponent?: IUserAPI;
}


export async function enterCompetitiveGameApi(userId: string) {
    return apiClient.get(`${URL}/competitiveMatch/${userId}`)
}

export async function getMatchesReq(userId: string) {
    return apiClient.get(`${URL}/user/${userId}`)
}

export async function enterExhibitionGameApi(userId: string, powerups: string) {
    return apiClient.get(`${URL}/exhibitionMatch/${userId}/${powerups.toString()}`)
}

export async function challenge(opponentId: string) {
    return apiClient.post(`${URL}/challenge`, {
        opponentId,
        powerups: "N"
    })
}

export async function getCurrentMatch(userId: string) {
    return apiClient.post(`${URL}/getCurrentMatch`, { userName: userId })
}

export async function cancelMatchmaking() {
    return apiClient.post(`${URL}/cancelMatchmaking`)
}