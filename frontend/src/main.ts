import { createApp} from 'vue'
import App from './App.vue'
import {createRouter, createWebHistory, useRoute} from 'vue-router' 
import Login from './components/Login.vue'
import SignUp from './components/SignUp.vue'
import Home from './components/Home.vue'
import BootstrapVue3 from 'bootstrap-vue-3'
import VueAxios from 'vue-axios'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import { store, key } from './store/store'




const routes = [
  { path: '/', name: "home", component: Home, meta: { requiresAuth: true}},
  { path: '/login', name: "login", component: Login, meta: { onlyWithoutAuth: true}},
  { path: '/signUp', name: "signUp", component: SignUp, meta: { onlyWithoutAuth: true}},
]

const router = createRouter({
    
  history: createWebHistory(),
  routes,
})


router.beforeEach((to, from, next) => {
    console.log("enruta");
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
app.use(BootstrapVue3)
app.use(VueAxios, axios)
app.mount('#app')
