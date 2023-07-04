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

export async function getMatchesReq(userId: string) {
    return apiClient.get(`${URL}/user/${userId}`)
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
