import { apiClient } from "./baseApi";
import { IUserAPI } from "./user";

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
    opponent?: IUserAPI;
}


export async function enterCompetitiveGameApi(userId: string) {
    return apiClient.get(`${URL}/competitiveMatch/${userId}`)
}

//todo: revisar con pablo. Usamos esto? Si no lo vamos a usar lo borramos aquí y en el backend
export async function getMatchesReq(userId: string) {
    return apiClient.get(`${URL}/user/${userId}`)
}

export async function enterExhibitionGameApi(userId: string, powerups: string) {
    return apiClient.get(`${URL}/exhibitionMatch/${userId}/${powerups.toString()}`)
}

export async function challenge(userId: string, opponentName: string) {
    return apiClient.post(`${URL}/challenge`, {
        requesterName: userId,
        opponentName: opponentName,
        powerups: "N"
    })
}

export async function getCurrentMatch(userId: string) {
    return apiClient.post(`${URL}/getCurrentMatch`, { userName: userId })
}

export async function cancelMatchmaking() {
    return apiClient.post(`${URL}/cancelMatchmaking`)
}