import { API_END_POINT } from "@/config";
import { store } from "@/store/store";
import { App } from "vue";

export function generateImageURL(): string {
  if (!store.state.user) {
    console.error("no hay id y esta intentando modificar, no debería ni pasar");
    return "";
  }

  return `${API_END_POINT}/users/${store.state.user.id}/image`;
}

export function throwFromAsync(app: App<Element>, e: Error | string) {
  if (typeof e === "string")
    e = new Error(e)
  const errorHandler = app.config.errorHandler || console.error
  errorHandler(e)
}

export function publishNotification(message: string, isError: boolean) {
  store.commit("setNotification", { message, isError})
}