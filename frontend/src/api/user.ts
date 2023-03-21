import { apiClient } from "./baseApi";

const URL = "/users";
const IMAGE_URL = "/image"

export interface IUserAPI {
    username: string,
    email: string,
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

async function getImage(id: string) {
    return apiClient.get(`${URL}/${id}${IMAGE_URL}`)
}

async function putImage(id: string, image: File) {
    const formData = new FormData();
    formData.append('file', image, 'file');

    return apiClient.put(`${URL}/${id}${IMAGE_URL}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });
}

export { updateUser, getUserById, getUserByName, getImage, putImage }