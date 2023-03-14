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

export async function createChatRoom(roomName:string, owner:string, password = "") {
    
    const room : any = {
        name: roomName,
        ownerId: owner,
        password: password,
        isPrivate: password.length > 0 ? true : false,
    }

    return apiClient.post(`${URL}/rooms`, room)
}

export async function getChatRoomsForUser(userId: string) {
    return apiClient.get(`${URL}/rooms/${userId}`);
}

export async function getUserMemberships(userId: string) : Promise<Membership[]> {
    return await (await apiClient.get(`${URL}/memberships/user/${userId}`)).data
}

export async function getChatRoomByName(name: string) {
    return apiClient.get(`${URL}/rooms/name/${name}`)
}

export async function getChatRoomMessages(roomId: string) {
    return apiClient.get(`${URL}/messages/${roomId}`)
}

export async function joinChatRoom(roomId: string, userId: string) {
    return apiClient.post(`${URL}/rooms/${roomId}/join`, {userId})
}

export async function inviteUsers(roomID: string, usersIds:string[]) {
    return apiClient.post(`${URL}/rooms/${roomID}/invite`, usersIds)
}

export async function postChatMessage(roomId: string, message : ChatMessage) {
    return apiClient.post(`${URL}/messages/${roomId}`, message)
}