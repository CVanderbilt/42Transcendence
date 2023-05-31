import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { useSocketIO } from "../main";

export interface IUser {
  id: string,
  email: string,
  username: string,
  password: string,
  pic: string,
  is2fa: boolean,
  role: string,
  isBanned: boolean
}

// define your typings for the store state
export interface State {
  apiCode: string
  chats:  [{ name: string, role: string, isBanned: boolean, isMuted: boolean}]
  socket: any
  user?: IUser
  notification: { message: string, isError: boolean }
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()
export const store = createStore<State>({
  state: {
    apiCode: "",
    chats: [{ name: "general", role: "user", isBanned: false, isMuted: false}],
    socket: null,
    notification: { message: "message", isError: false}
  },

  mutations: {
    setNotification(state, { message, isError }) {
      state.notification = {
        message,
        isError,
      }
    },
    removeChats(state){
      state.chats = [{ name: "general", role: "user", isBanned: false, isMuted: false}]
    },
    setupChats(state, chats: [{ name: string, role: string, isBanned: boolean, isMuted: boolean}]){
      state.chats = chats;
    },
    connectSocket(state) {
      state.socket = useSocketIO();
    },
    changeUser(state, user: IUser) {
      state.user = user;
      console.log("changing user");
      console.log({user});
      console.log(state.user);
    },
    changeUserName(state, userName: string) {
      if (state.user) {
        state.user.username = userName;
      }
    },
    set2fa(state, is2fa: boolean) {
      if (state.user) {
        state.user.is2fa = is2fa;
      }
    }
  },
  actions: {
    connectSocket() {
      this.state.socket = useSocketIO();
    }
  },
  plugins: [createPersistedState()]
})