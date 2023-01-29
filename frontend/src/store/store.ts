import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import  createPersistedState  from  'vuex-persistedstate'
import {io} from 'socket.io-client'

// define your typings for the store state
export interface State {
  login: boolean
  username: string
  email: string
  apiCode: string
  pictureURL: string
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
    socket: ""
  },
  mutations:{
    changeLogin(state) {
      
        state.login =  !state.login
        if(!state.login){
            state.username = ""
        }
    },
    changeUsername(state, username) {
        state.username =  username
    },
    changePicture(state, url) {
      if(url === ""){
      state.pictureURL =  ""
      }
      else{

        state.pictureURL = url
      }
    },
    changeEmail(state, email) {
      state.email =  email
  },
  connectSocket(state, socket) {
    state.socket = socket
}
  },
actions: {
    mockLogin(context, user) {

        this.state.username = user
        setTimeout(function () {
            context.commit('changeLogin')
        }, 1000)
    }
    },
  plugins: [createPersistedState()]
})