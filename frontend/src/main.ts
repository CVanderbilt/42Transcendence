import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory, useRoute } from 'vue-router'
import Login from './pages/login/Login.vue'
import SignUp from './pages/signup/SignUp.vue'
import Settings from './pages/settings/Settings.vue'
import Home from './pages/home/Home.vue'
import Chat from './pages/chats/Chat.vue'
import Chat2 from './pages/chats/Chat2.vue'
import Game from './pages/game/Game.vue'
import QrValidation from './pages/2fa/Qr.vue'
import BootstrapVue3 from 'bootstrap-vue-3'
import VueAxios from 'vue-axios'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import { store, key } from './store/store'
import io from 'socket.io-client';
import User from './components/User.vue'

const routes = [
    { path: '/', name: "home", component: Home, meta: { requiresAuth: true } },
    { path: '/login', name: "login", component: Login, meta: { onlyWithoutAuth: true } },
    { path: '/signUp', name: "signUp", component: SignUp, meta: { onlyWithoutAuth: true } },
    { path: '/settings', name: "settings", component: Settings, meta: { requiresAuth: true } },
    { path: '/chats', name: "chats", component: Chat, meta: { requiresAuth: true } },
    { path: '/chats2', name: "chats2", component: Chat2, meta: { requiresAuth: true } },
    { path: '/user', name: "user", component: User, meta: { requiresAuth: true } },
    { path: '/game', name: "game", component: Game, meta: { requiresAuth: true } },
    { path: '/qr', name: "qr", component: QrValidation, meta: { requiresAuth: true } },
]

const router = createRouter({

    history: createWebHistory(),
    routes,
})


router.beforeEach((to, from, next) => {
    console.log("enruta");
    if (to.matched.some(route => route.meta.requiresAuth)) {
        if (!store.state.user && to.matched.some(route => route.meta.requiresAuth)) {
            next('/login')
        }
        else {
            next()
        }
    }
    else if (to.matched.some(route => route.meta.onlyWithoutAuth)) {
        if (store.state.user) {
            next('/')
        }
        else {
            next()
        }
    }
    else {
        next()
    }
})

export const app = createApp(App);

export const useSocketIO = () => {
    const socket = io('http://localhost:81')
    return {
        socket,
    }
}

export const gameSocketIO = () => {
    const socket = io('http://localhost:82')
    return {
        socket,
    }
}

app.use(store, key)
app.use(router)
app.use(BootstrapVue3)
app.use(VueAxios, axios)
app.mount('#app')
