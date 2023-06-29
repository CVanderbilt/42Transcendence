import axios, { AxiosError } from "axios";
import { API_END_POINT } from "@/config";
import { throwFromAsync } from "@/utils/utils";
import { app } from "@/main";
import jwtDecode from 'jwt-decode';
import { store } from "@/store/store";

const apiClient = axios.create({
  baseURL: API_END_POINT
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    const decodedToken = jwtDecode<{ exp: number; [key: string]: any }>(token);

    if (decodedToken.exp * 1000 < Date.now()) {
      store.commit("changeUser", undefined)
      localStorage.removeItem("token");
      window.location.href = 'http://localhost:8080/';
      throwFromAsync(app, "Token expired, loging out")
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => { alert("!!!");throwFromAsync(app, (error.response?.data as any).message ?? error.message) }
);*/

export { apiClient };
