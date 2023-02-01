import { apiClient } from "./baseApi";

const URL = "/chatname";

export interface IMessage {
    message: string,
    username: string,
}

export interface NewChatOptions {
    chatname: string,
    password: string,
    messages: IMessage[],
}

async function getChat(name: string) {
    return apiClient.get(`${URL}/${name}`);
}

export {getChat}