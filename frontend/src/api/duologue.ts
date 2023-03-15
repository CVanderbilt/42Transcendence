import { apiClient } from "./baseApi";

const URL = "/duologues";

export interface Duologue {
    duologueId?: string,
    user1Id: string,
    user2Id: string,
}

export async function getDuologue(user1Id: string, user2Id: string) {
    const duologue : any = {
        user1Id: user1Id,
        user2Id: user2Id,
    }
    return apiClient.get(`${URL}`, duologue);
}