import axios from "axios"
import { apiEndpoint } from "@/config"

export const apiClient = axios.create({
    baseURL: apiEndpoint
})

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});