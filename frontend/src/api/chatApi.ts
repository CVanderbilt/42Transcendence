import { apiClient } from "./baseApi";

const URL = "/chats";

export interface IMessage {
    message: string,
    username: string,
}

export interface NewChatOptions {
    chatname: string,
    password: string,
    messages: IMessage[],
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

async function newChat(options: NewChatOptions) {
    return apiClient.post(URL, options);
}

async function updateChat(id: string, options: NewChatOptions) {
    return apiClient.put(`${URL}/${id}`, options);
}

async function getChatById(id: string) {
    return apiClient.get(`${URL}/${id}`);
}

// ----------------------------------------------

async function getChatRoomsForUser(userId: string) {
    return apiClient.get(`${URL}/rooms/${userId}`);
}

async function getUserMemberships(userId: string) {
    return apiClient.get(`${URL}/memberships/user/${userId}`);
}

async function getChatRoomByName(name: string) {
    try {
        const response = await apiClient.get(`${URL}/rooms/name/${name}`)
        return response.data
    }
    catch (error) {
        console.log(error)
    }
}

async function getChatRoomMessages(roomId: string) {
    try {
        const response = await apiClient.get(`${URL}/rooms/${roomId}/messages`)
        return response.data
    }
    catch (error) {
        console.log(error)
    }
}

export {
    updateChat, 
    getChatById, 
    newChat, 
    makeid,
    getChatRoomsForUser, 
    getUserMemberships,
    getChatRoomByName, 
    getChatRoomMessages,
}