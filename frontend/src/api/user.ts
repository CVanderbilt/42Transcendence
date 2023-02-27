import { apiClient } from "./baseApi";

const URL = "/users";

export interface IUserAPI {
    username: string,
    is2fa: boolean,
}

async function createUser(options: IUserAPI) {
    return apiClient.post(URL, {...options, chats: [{name: "general", role: "user"}]});
}

async function updateUser(id: string, options: IUserAPI) {    
    alert(`will update user ${id} !!!`)
    return apiClient.put(`${URL}/${id}`, options);
}

async function getUserById(id: string) {
    return apiClient.get(`${URL}/${id}`)
}

export async function updateUserChats(id: string, options: string){
    return apiClient.put(`${URL}/${id}`, options)
}

export {createUser, updateUser, getUserById }