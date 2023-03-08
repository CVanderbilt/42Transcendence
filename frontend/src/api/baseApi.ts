import axios from "axios"
import { API_END_POINT } from "@/config"

export const apiClient = axios.create({
    baseURL: API_END_POINT
})

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});