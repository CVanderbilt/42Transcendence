import axios, { AxiosError } from "axios";
import { API_END_POINT } from "@/config";
import { publishNotification } from "@/utils/utils";
import jwtDecode from 'jwt-decode';
import { store } from "@/store/store";

const apiClient = axios.create({
  baseURL: API_END_POINT
});

function logOut() {
  store.commit("changeUser", undefined)
  localStorage.removeItem(store.state.user.id);
  window.location.href = 'http://localhost:8080/login?expired';
}

apiClient.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token');
  const token = localStorage.getItem(store.state?.user?.id)
  if (token) {
    const decodedToken = jwtDecode<{ exp: number;[key: string]: any }>(token);

    if (decodedToken.exp * 1000 < Date.now()) {
      logOut()
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // console.log(error.response)
    if (error.response) {
      if (error.response.status === 442)
        logOut()
    }
    throw error
  }
);

export { apiClient };
