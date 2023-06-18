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


export async function enterCompetitiveGameApi(userName: string) {
    return apiClient.get(`${URL}/competitiveMatch/${userName}`)
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

export async function getMatchesReq(userId: string) {
    return apiClient.get(`${URL}/user/${userId}`)
}

export async function enterExhibitionGameApi(userName: string, powerups: string) {
    return apiClient.get(`${URL}/exhibitionMatch/${userName}/${powerups.toString()}`)
}