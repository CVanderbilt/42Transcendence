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

async function newChat(options: NewChatOptions) {
    return apiClient.post(URL, options);
}

async function updateChat(id: string, options: NewChatOptions) {
    return apiClient.put(`${URL}/${id}`, options);
}

async function getChatById(id: string) {
    return apiClient.get(`${URL}/${id}`);
}

export {updateChat, getChatById, newChat}