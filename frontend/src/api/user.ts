import { apiClient } from "./baseApi";

const URL = "/users";

export interface IUserAPI {
    id?: string,
    username: string,
    is2fa: boolean,
    // pic : string, // TODO: add pic
}


// async function createUser(options: IUserAPI) {
//     return apiClient.post(URL, {...options, chats: [{name: "general", role: "user"}]});
// } // Esto sucede automáticamente en el backend cuando un usuario se registra

async function updateUser(id: string, options: IUserAPI) {    
    alert(`will update user ${id} !!!`)
    return apiClient.put(`${URL}/${id}`, options);
}

async function getUserById(id: string) {
    return apiClient.get(`${URL}/${id}`)
}

async function getUserByName(username: string) {
    return apiClient.get(`${URL}/name/${username}`)
}

export async function updateUserChats(id: string, options: string){
    return apiClient.put(`${URL}/${id}`, options)
}

export { updateUser, getUserById, getUserByName }