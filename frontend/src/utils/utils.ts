import { API_END_POINT } from "@/config";
import { store } from "@/store/store";
import { App } from "vue";

export function generateImageURL(userId = ""): string {
  if (!userId) {
    userId = store.state.user.id;
  }
  if (!userId) {
    return "";
  }

  return `${API_END_POINT}/users/${userId}/image`;
}

export function throwFromAsync(app: App<Element>, e: Error | string | undefined) {
  if (!e)
    e = new Error("undefined error")
  if (typeof e === "string")
    e = new Error(e)
  const errorHandler = app.config.errorHandler || console.error
  errorHandler(e)
}

export function publishNotification(message: string, isError: boolean) {
  store.commit("setNotification", { message, isError})
}

export function handleHttpException(app:any, error: any) {
  throwFromAsync(app, (error.response?.data as any).message ?? error.message)
}

export function isAuthenticated() {
  // const token = localStorage.getItem('token')
  const token = store.state.token
  if (!token)
    return false
  if (store.state.user.is2faEnabled && !store.state.user.is2fa)
    return false
  return true
}