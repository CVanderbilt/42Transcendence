import { apiClient } from "./baseApi";

const URL = "/auth";

async function get42Token(code: string) {
    return apiClient.post(`${URL}/login`, {code});
}

async function signup(data: { email: string, password: string, username: string }) {
    return apiClient.post(`${URL}/esignup`, data);
}

async function elogin(data: { email: string, password: string }) {
    return apiClient.post(`${URL}/elogin`, data);
}

export { get42Token, signup, elogin }