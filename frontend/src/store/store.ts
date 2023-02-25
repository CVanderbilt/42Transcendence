import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { io } from 'socket.io-client'
import { useSocketIO } from "../main";
import { isNumeric } from 'bootstrap-vue-3/dist/utils';

export interface IUser {
  id: string,
  username: string,
  email: string,
  password: string,

  pic: string,

}
// define your typings for the store state
export interface State {
  apiCode: string
  chats:  [{ name: string, role: string, isBanned: boolean, isMuted: boolean}]
  socket: any
  user?: IUser
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()
export const store = createStore<State>({
  state: {
    apiCode: "",
    chats: [{ name: "general", role: "user", isBanned: false, isMuted: false}],
    socket: null,
  },

  mutations: {
    
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
      //console.log(user.username)
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