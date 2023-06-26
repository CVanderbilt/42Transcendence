
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

async function unfriendRequest(friendshipId: string) {
    return apiClient.post(`${URL}/${friendshipId}`, { isFriend: false });
}

async function setBlockFriendRequest(friendshipId: string, isBlocked: boolean) {
    return apiClient.post(`${URL}/${friendshipId}`, { isBlocked: isBlocked });
}

export { makeFriendshipRequest, getFriendshipsRequest, unfriendRequest, setBlockFriendRequest }