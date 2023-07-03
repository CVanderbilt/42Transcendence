
import { apiClient } from "./baseApi";

const URL = "/friendships";

export interface IFriend {
    id: string,
    username: string,
    createdAt: string,
    victories: number,
    defeats: number,
    score: number,
    email: string,
}

export interface IFriendship {
    id: string,
    userId: string,
    friendId: string,
    isBlocked: boolean,
    friend: IFriend,
    isFriend: boolean,
}

async function getFriendshipsRequest(userId: string): Promise<IFriendship[]> {
    const friendships = await apiClient.get(`${URL}/user/${userId}`);
    return friendships.data;
}

async function makeFriendshipRequest(userId: string, friendId: string) {
    return apiClient.post(`${URL}`, { userId: userId, friendId: friendId });
}

async function unfriendRequest(userId: string, friendshipId: string) {
    return apiClient.post(`${URL}/${friendshipId}`, { userId:userId, isFriend: false });
}

async function setBlockFriendRequest(userId: string, friendshipId: string, isBlocked: boolean) {
    console.log("setBlockFriendRequest", friendshipId, isBlocked)
    return apiClient.post(`${URL}/${friendshipId}`, { userId:userId, isBlocked: isBlocked });
}

export { makeFriendshipRequest, getFriendshipsRequest, unfriendRequest, setBlockFriendRequest }