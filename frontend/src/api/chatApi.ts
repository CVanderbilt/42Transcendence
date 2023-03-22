import { apiClient } from "./baseApi";

const URL = "/chats";

export interface ChatMessage {
    senderId?: string,
    senderName?: string,
    chatRoomId: string,
    content: string,
}

export interface Membership {
    userId: string
    chatRoomId: number
    isAdmin?: boolean
    isBanned?: boolean
    bannedUntil?: Date
    isMuted?: boolean
    mutedUntil?: Date
    chatRoomName?: string
    userName?: string
}

export interface ChatRoom {
    name: string,
    password: string,
    isDirect?: boolean,
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

export async function getChatRoomReq(roomName:string, owner:string, password = "", isDirect = false) {
    
    const room : any = {
        name: roomName,
        ownerId: owner,
        password: password,
        isPrivate: password.length > 0 ? true : false,
        isDirect: isDirect
    }

    return apiClient.post(`${URL}/rooms`, room)
}

export async function getChatRoomsForUserReq(userId: string) {
    return apiClient.get(`${URL}/rooms/${userId}`);
}

export async function getUserMembershipsReq(userId: string) : Promise<Membership[]> {
    return await (await apiClient.get(`${URL}/memberships/user/${userId}`)).data
}

export async function getChatRoomByNameReq(name: string) {
    return apiClient.get(`${URL}/rooms/name/${name}`)
}

export async function getChatRoomMessagesReq(roomId: string) {
    return apiClient.get(`${URL}/messages/${roomId}`)
}

export async function joinChatRoomReq(roomId: string, userId: string) {
    return apiClient.post(`${URL}/rooms/${roomId}/join`, {userId})
}

export async function inviteUsersReq(roomID: string, userId: string) {
    console.log("inviting user: " + userId + " to room: " + roomID)

    return apiClient.post(`${URL}/rooms/${roomID}/invite`, {userId})
}

export async function postChatMessageReq(roomId: string, message : ChatMessage) {
    return apiClient.post(`${URL}/messages/${roomId}`, message)
}

export async function leaveChatRoomReq(roomId: string, userId: string) {
    alert("leaving room: " + roomId + " user: " + userId + "")
    return apiClient.post(`${URL}/rooms/${roomId}/leave`, {userId})
}