import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { io } from 'socket.io-client'
import { useSocketIO } from "../main";

export interface IUser {
  id: string,
  username: string,
  email: string,
  password: string,
}
// define your typings for the store state
export interface State {
  apiCode: string
  chats:  [{ name: string}]
  socket: any
  user?: IUser
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()
export const store = createStore<State>({
  state: {
    apiCode: "",
    chats: [{ name: "general"}],
    socket: null,
  },

  mutations: {
    addChat(state, name: string){
      state.chats.push({name: name})
    },
    removeChats(state){
      state.chats = [{ name: "general"}]
    },
    setupChats(state, chats: [{ name: string}]){
      state.chats = chats;
    },
    connectSocket(state) {
      state.socket = useSocketIO();
    },
    changeUser(state, user: IUser) {
      state.user = user;
    },
  },
  actions: {
    connectSocket() {
      this.state.socket = useSocketIO();
    }
  },
  plugins: [createPersistedState()]
})