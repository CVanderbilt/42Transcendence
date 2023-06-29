import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './pages/login/Login.vue'
import SignUp from './pages/signup/SignUp.vue'
import Settings from './pages/settings/Settings.vue'
import Home from './pages/home/Home.vue'
import Chat2 from './pages/chats/Chat2.vue'
import Game from './pages/game/Game.vue'
import Matchmaking from './pages/matchmaking/MatchMaking.vue'
import QrValidation from './pages/2fa/Qr.vue'
import Friends from './pages/friends/Friends.vue'
import BootstrapVue3 from 'bootstrap-vue-3'
import VueAxios from 'vue-axios'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import { store, key } from './store/store'
import io from 'socket.io-client'
import User from './components/User.vue'
import NotificationBanner from './components/NotificationBanner.vue'
import EndGame from './pages/endGame/endGame.vue'
import Admin from './pages/admin/Admin.vue'
import Rules from './pages/rules/Rules.vue'
import { isAuthenticated, publishNotification, throwFromAsync } from './utils/utils'

const routes = [
  { path: '/', name: 'home', component: Home, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login, meta: { onlyWithoutAuth: true } },
  { path: '/signUp', name: 'signUp', component: SignUp, meta: { onlyWithoutAuth: true } },
  { path: '/settings', name: 'settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/chats', name: 'chats', component: Chat2, meta: { requiresAuth: true } },
  { path: '/user', name: 'user', component: User, meta: { requiresAuth: true } },
  { path: '/game', name: 'game', component: Game, meta: { requiresAuth: true } },
  { path: '/qr', name: 'qr', component: QrValidation, meta: { requiresAuth: true } },
  { path: '/friends', name: 'friends', component: Friends, meta: { requiresAuth: true } },
  { path: '/matchmaking', name: 'matchmaking', component: Matchmaking, meta: { requiresAuth: true } },
  { path: '/endgame', name: 'endGame', component: EndGame, meta: { requiresAuth: true } },
  { path: '/admin', name: 'adminPage', component: Admin, meta: { requiresAuth: true } },
  { path: '/rules', name: 'rules', component: Rules, meta: { requiresAuth: false } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((route) => route.meta.requiresAuth)) {
    if (!isAuthenticated()) {
      next('/login')
    }
    else {
      next();
    }
  } else if (to.matched.some((route) => route.meta.onlyWithoutAuth)) {
    if (isAuthenticated()) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export const app = createApp(App)

export const useSocketIO = () => {
  const socket = io('http://localhost:81')
  return {
    socket
  }
}

export const gameSocketIO = () => {
  const socket = io('http://localhost:82')
  return {
    socket
  }
}

export const chatSocketIO = () => {
  const socket = io('http://localhost:83')
  return {
    socket
  }
}

export const stateSocketIO = () => {
  const socket = io('http://localhost:84')
  return {
    socket
  }
}
  
app.use(store, key)
app.use(router)
app.use(BootstrapVue3)
app.use(VueAxios, axios)

app.component('notification-banner', NotificationBanner)

app.config.errorHandler = (error: any, vm, info) => {
  publishNotification(error.message, true)
}

// Este no hace falta porq ya tenemos el otro
/*window.onerror = function (msg, url, line, col, error) {
  //code to handle or report error goes here
  alert("emergency unhandled error!!!")
}*/

//este handler pilla errores de funciones asyn que no estemos manejando, al redirigir previene errores derivados de ese error y al lanzar un error propio previene otros errores que pudieran hber inmediatamente despues
window.addEventListener('unhandledrejection', function(event) {
  window.location.href = 'http://localhost:8080/'; //todo sacar este valor de env variables
  throw new Error("redirecting due to undhandled error")
});

app.mount('#app')





