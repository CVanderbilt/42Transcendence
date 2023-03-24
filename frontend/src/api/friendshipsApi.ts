import { apiClient } from "./baseApi";

const URL = "/friendships";

export interface IFriend {
    id: string,
    username: string,
    pic?: string,
    createdAt: string,
    victories: number,
    defeats: number,
    achievements: string,
}

export interface IFriendship {
    id: string,
    userId: string,
    friendId: string,
    isBlocked: boolean,
    friend: IFriend
}

async function getFriendshipsRequest(userId: string): Promise<IFriendship[]> {
    const friendships = await apiClient.get(`${URL}/user/${userId}`);
    return friendships.data;
}

async function makeFriendshipRequest(userId: string, friendId: string) {
    return apiClient.post(`${URL}`, { userId: userId, friendId: friendId });
}

async function unfriendRequest(friendshipId: string) {
    return apiClient.delete(`${URL}/${friendshipId}`);
}

async function setBlockFriendRequest(friendshipId: string, isBlocked: boolean) {
    console.log("setBlockFriendRequest")
    console.log(friendshipId)
    return apiClient.post(`${URL}/${friendshipId}`, { isBlocked: isBlocked });
}

export { makeFriendshipRequest, getFriendshipsRequest, unfriendRequest, setBlockFriendRequest }