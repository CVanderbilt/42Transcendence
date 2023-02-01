import axios from "axios"
import { apiEndpoint } from "@/config"

export const apiClient = axios.create({
    baseURL: apiEndpoint
})