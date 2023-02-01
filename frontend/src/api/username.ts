import { apiClient } from "./baseApi";

const URL = "/username"; //todo: juntar con user (para eso habría que juntarlo también en el backend)

async function getUser(name: string) {
    return apiClient.get(`${URL}/${name}`);
}

export {getUser}