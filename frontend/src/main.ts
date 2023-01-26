import { createApp} from 'vue'
import App from './App.vue'
import {createRouter, createWebHashHistory} from 'vue-router' 
import Login from './components/Login.vue'
import SignUp from './components/SignUp.vue'
import Home from './components/Home.vue'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue'
import VueAxios from 'vue-axios'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { store, key } from './store/store'




const routes = [
  { path: '/', name: "home", component: Home, meta: { requiresAuth: true}},
  { path: '/login', name: "login", component: Login, meta: { onlyWithoutAuth: true}},
  { path: '/signUp', name: "signUp", component: SignUp, meta: { onlyWithoutAuth: true}},
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
    if(to.matched.some(route => route.meta.requiresAuth)){
        if(!store.state.login && to.matched.some(route => route.meta.requiresAuth)) {
            next('/login')
        }
        else {
            next()
        }
    }
    else if(to.matched.some(route => route.meta.onlyWithoutAuth)){
            if(store.state.login) {
                next('/')
            }
            else {
                next()
            }
        }
        else{
            next()
        }
    })


export const app = createApp(App);
app.use(store,key)
app.use(router)
app.use(VueAxios)
app.mount('#app')
