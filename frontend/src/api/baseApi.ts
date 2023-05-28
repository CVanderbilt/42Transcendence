import axios, { AxiosError } from "axios";
import { API_END_POINT } from "@/config";
import { throwFromAsync } from "@/utils/utils";
import { app } from "@/main";

const apiClient = axios.create({
  baseURL: API_END_POINT
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => { throwFromAsync(app, (error.response?.data as any).message ?? error.message) }
);

export { apiClient };
