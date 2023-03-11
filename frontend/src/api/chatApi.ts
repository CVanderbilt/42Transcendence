import { apiClient } from "./baseApi";

const URL = "/chats";

export interface ChatMessage {
    senderId?: string,
    senderName?: string,
    roomId: string,
    content: string,
}

export interface NewChatOptions {
    chatname: string,
    password: string,
    // messages: IMessage[],
}

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

// async function newChat(options: NewChatOptions) {
//     return apiClient.post(URL, options);
// }

// async function updateChat(id: string, options: NewChatOptions) {
//     return apiClient.put(`${URL}/${id}`, options);
// }

// async function getChatById(id: string) {
//     return apiClient.get(`${URL}/${id}`);
// }

// ----------------------------------------------

async function createChatRoom(roomName:string, owner:string, password = "") {
    
    const room : any = {
        name: roomName,
        ownerId: owner,
        password: password,
        isPrivate: password.length > 0 ? true : false,
    }

    return apiClient.post(`${URL}/rooms`, room)
}

async function getChatRoomsForUser(userId: string) {
    return apiClient.get(`${URL}/rooms/${userId}`);
}

async function getUserMemberships(userId: string) {
    return apiClient.get(`${URL}/memberships/user/${userId}`);
}

async function getChatRoomByName(name: string) {
    return apiClient.get(`${URL}/rooms/name/${name}`)
}

async function getChatRoomMessages(roomId: string) {
    return apiClient.get(`${URL}/messages/${roomId}`)
}

async function joinChatRoom(roomId: string, userId: string) {
    return apiClient.post(`${URL}/rooms/${roomId}/join`, {userId})
}

async function inviteUsers(roomID: string, usersIds:string[]) {
    return apiClient.post(`${URL}/rooms/${roomID}/invite`, usersIds)
}

async function postChatMessage(roomId: string, message : ChatMessage) {
    return apiClient.post(`${URL}/messages/${roomId}`, message)
}

export {
    // updateChat, 
    // getChatById, 
    // newChat, 
    makeid,
    getChatRoomsForUser, 
    getUserMemberships,
    getChatRoomByName, 
    getChatRoomMessages,
    joinChatRoom,
    inviteUsers,
    createChatRoom,
    postChatMessage,
}