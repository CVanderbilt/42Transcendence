import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import  createPersistedState  from  'vuex-persistedstate'

// define your typings for the store state
export interface State {
  login: boolean
  username: string
  email: string
  apiCode: string
  pictureURL: string
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    login: false,
    username: "",
    email: "",
    apiCode: "",
    pictureURL: "https://www.pngall.com/wp-content/uploads/5/Profile-Male-Transparent.png"
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
      state.pictureURL =  "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File-Download-Free.png"
      }
      else{

        state.pictureURL = url
      }
    },
    changeEmail(state, email) {
      state.email =  email
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