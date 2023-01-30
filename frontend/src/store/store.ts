import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { io } from 'socket.io-client'
import { useSocketIO } from "../main";

// define your typings for the store state
export interface State {
  login: boolean
  username: string
  email: string
  apiCode: string
  pictureURL: string,
  user_uuid: string,
  chats:  [{ name: string}]
  socket: any
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    login: false,
    username: "",
    email: "",
    apiCode: "",
    pictureURL: "",
    socket: "",
    user_uuid: "",
    chats: [{ name: "general"}]
  },
  mutations: {
    changeLogin(state) {

      state.login = !state.login
      if (!state.login) {
        state.username = ""
      }
    },
    changeUsername(state, username) {
      state.username = username
    },
    changeUserUUID(state, userUUID) {
      state.user_uuid = userUUID
    },
    addChat(state, name: string){
      state.chats.push({name: name})
    },
    setupChats(state, chats: [{ name: string}]){
      state.chats = chats;
    },

    changePicture(state, url) {
      if (url === "") {
        state.pictureURL = ""
      }
      else {

        state.pictureURL = url
      }
    },
    changeEmail(state, email) {
      state.email = email
    },
    connectSocket(state) {
      state.socket = useSocketIO();
    }
  },
  actions: {
    mockLogin(context, user) {

      this.state.username = user
      setTimeout(function () {
        context.commit('changeLogin')
      }, 1000)
    },
    connectSocket() {
      this.state.socket = useSocketIO();
    }
  },
  plugins: [createPersistedState()]
})