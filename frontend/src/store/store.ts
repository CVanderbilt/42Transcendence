import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'
import  createPersistedState  from  'vuex-persistedstate'

// define your typings for the store state
export interface State {
  login: boolean
  username: string
  email: string
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    login: false,
    username: "",
    email: ""
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