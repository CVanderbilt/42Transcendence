import { API_END_POINT } from "@/config";
import { store } from "@/store/store";

export function generateImageURL(): string {
  if (!store.state.user) {
    console.error("no hay id y esta intentando modificar, no debería ni pasar");
    return "";
  }

  return `${API_END_POINT}/users/${store.state.user.id}/image`;
}
