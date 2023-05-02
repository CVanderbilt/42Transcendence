import { apiClient } from "./baseApi";

const URL = "/users";
const IMAGE_URL = "/image"

export interface IUserAPI {
    email?: string
    password?: string
    username: string
    is2fa?: boolean
    twofaSecret?: string // todo: no estoy seguro
}


// async function createUser(options: IUserAPI) {
//     return apiClient.post(URL, {...options, chats: [{name: "general", role: "user"}]});
// } // Esto sucede automáticamente en el backend cuando un usuario se registra

export async function updateUser(id: string, options: IUserAPI) {    
    alert(`will update user ${id} !!!`)
    return apiClient.put(`${URL}/${id}`, options);
}

export async function getUserById(id: string) {
    return apiClient.get(`${URL}/${id}`)
}

export async function getUserByName(username: string) {
    return apiClient.get(`${URL}/name/${username}`)
}

export async function updateUserChats(id: string, options: string){
    return apiClient.put(`${URL}/${id}`, options)
}

export async function getImage(id: string) {
    return apiClient.get(`${URL}/${id}${IMAGE_URL}`)
}

export async function putImage(id: string, image: File) {
    const formData = new FormData();
    formData.append('file', image, 'file');

    return apiClient.put(`${URL}/${id}${IMAGE_URL}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });
}

export async function getAllUsers() {
    return (await apiClient.get(`${URL}`)).data
}

export async function banUser(id: string) {
    apiClient.post(`${URL}/${id}/ban`)
}

export async function allowUser(id: string) {
    apiClient.post(`${URL}/${id}/allow`)
}

export async function promoteUser(id: string) {
    apiClient.post(`${URL}/${id}/promote`)
}

export async function demoteUser(id: string) {
    apiClient.post(`${URL}/${id}/demote`)
}