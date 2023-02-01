import { apiClient } from "./baseApi";

const URL = "/users";

export interface IUserAPI {
    username: string,
    password: string,
    email: string
}

async function createUser(options: IUserAPI) {
    return apiClient.post(URL, {...options, chats: [{name: "general"}]});
}

async function updateUser(id: string, options: IUserAPI) {
    alert("will update user!!!")
    return apiClient.put(`${URL}/${id}`, options);
}

async function getUserById(id: string) {
    return apiClient.get(`${URL}/${id}`)
}

export {createUser, updateUser, getUserById }