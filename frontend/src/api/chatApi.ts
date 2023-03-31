import { apiClient } from "./baseApi";
import { IUserAPI } from "./user";

const URL = "/chats";

export interface Member {
    id: string,
    username: string,
}

export interface ChatMessage {
    senderId?: string,
    senderName?: string,
    chatRoomId: string,
    content: string,
}

export interface ChatRoom {
    id: string,
    name: string,
    password?: string,
    isDirect?: boolean,
}

export interface Membership {
    id: string
    user: Member
    isOwner?: boolean
    isAdmin?: boolean
    isBanned?: boolean
    isMuted?: boolean
    chatRoomName?: string
    userName?: string
    chatRoom: ChatRoom
}

// export function makeid(length: number) { //TODO esto debería ser innecesario ya que se encarga el backend
//     let result = '';
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     const charactersLength = characters.length;
//     let counter = 0;
//     while (counter < length) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//       counter += 1;
//     }
//     return result;
// }

// ----------------------------------------------

export async function getChatRoomReq(roomName: string, password = "") {

    const room: any = {
        name: roomName,
        password: password,
    }

    return apiClient.get(`${URL}/rooms`, room)
}

export async function createChatRoomReq(roomName: string, owner: string, password = "", isDirect = false) {
    const room: any = {
        name: roomName,
        ownerId: owner,
        password: password,
        isPrivate: password.length > 0 ? true : false,
        isDirect: isDirect
    }

    return apiClient.post(`${URL}/rooms`, room)
}

export async function updateChatRoomPasswordReq(roomId: string, password: string) {
    return apiClient.post(`${URL}/rooms/${roomId}/password`, {password: password})
}

export async function getChatRoomsForUserReq(userId: string) {
    return apiClient.get(`${URL}/rooms/${userId}`);
}


export async function getChatRoomByNameReq(name: string) {
    return apiClient.get(`${URL}/rooms/name/${name}`)
}

export async function getChatRoomMessagesReq(roomId: string) {
    return apiClient.get(`${URL}/messages/${roomId}`)
}

export async function joinChatRoomReq(roomId: string, userId: string, password?: string) {
    return apiClient.post(`${URL}/rooms/${roomId}/join`, { userId, password })
}

export async function inviteUsersReq(roomID: string, userId: string) {
    console.log("inviting user: " + userId + " to room: " + roomID)
    
    return apiClient.post(`${URL}/rooms/${roomID}/invite`, { userId })
}

export async function postChatMessageReq(roomId: string, message: ChatMessage) {
    return apiClient.post(`${URL}/messages/${roomId}`, message)
}

export async function leaveChatRoomReq(roomId: string, userId: string) {
    alert("leaving room: " + roomId + " user: " + userId + "")
    return apiClient.post(`${URL}/rooms/${roomId}/leave`, { userId })
}

// memberships
export async function getUserMembershipsReq(userId: string) {
    return (await apiClient.get(`${URL}/memberships/user/${userId}`))
}

export async function getChatRoomMembershipsReq(roomId: string) {
    return apiClient.get(`${URL}/rooms/${roomId}/members`)
}

export async function updateChatRoomMembershipsReq(membershipId: string, data: Membership) {
    return apiClient.put(`${URL}/memberships/${membershipId}`, data)
}

export async function deleteChatRoomMembershipsReq(membershipId: string) {
    return apiClient.delete(`${URL}/memberships/${membershipId}`)
}