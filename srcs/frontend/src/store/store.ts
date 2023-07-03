 /* eslint-disable */

import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { useSocketIO } from "../main";

export class IUser {
  id = "";
  email = "";
  username = "";
  password = "";
  pic = "";
  is2fa = false;
  is2faEnabled = true;
  role = "";
  isBanned = false;
  createdAt? = "";
  victories? = 0
  defeats? = 0
  score? = 0
}

// define your typings for the store state
export interface State {
  apiCode: string
  chats:  [{ name: string, role: string, isBanned: boolean, isMuted: boolean}]
  socket: any
  user: IUser
  notification: { message: string, isError: boolean }
  usersState: UserState[]
  token: string | undefined
}

export interface UserState {
  userId: string
  state: string
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()
export const store = createStore<State>({
  state: {
    apiCode: "",
    chats: [{ name: "general", role: "user", isBanned: false, isMuted: false}],
    socket: null,
    notification: { message: "message", isError: false},
    user : new IUser(),
    usersState: [],
    token: "",
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
    },
    logout(state) {
      state.user = new IUser();
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