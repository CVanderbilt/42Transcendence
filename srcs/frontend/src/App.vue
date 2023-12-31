<template>
  <div class="gradient-custom" style="height: auto; min-height: 100vh;">
    <!-- Navbar -->
    <div v-if="user.username !== ''">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <router-link to="/"><img src="./assets/logo.png" height="30"
              style="margin-right: 20px ; border-radius: 10%" /></router-link>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">

            <div style="width: 250px">
              <input type="search" class="form-control rounded" placeholder="Search friends..." aria-label="Search"
                v-model="searchUsername" v-on:keyup.enter="searchFriend(searchUsername)" />
            </div>

            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <router-link class="nav-link" to="/chats">Chats</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/matchmaking">Game</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/friends">Friends</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/rules">Rules</router-link>
              </li>
            </ul>
            <ul class="navbar-nav">
              <li class="nav-item">
                <router-link class="nav-link" to="/settings">{{ user.username }} </router-link>
              </li>
              <img :src="generateImageURL()" class="rounded-circle" height="40
                " style="border-radius: 50%" alt="" loading="lazy" />
            </ul>

            <ul class="navbar-nav d-flex flex-row ms-1 me-45">
              <button right class="btn btn-outline-light m-md-2" variant="light"
                v-on:click="modifyProfileRoute()">Settings</button>
            </ul>
          </div>
        </div>
      </nav>
    </div>
    <div>
      <router-view />
    </div>
    <notification-banner />
  </div>
</template>

<script lang="ts">

 /* eslint-disable */
 
import { computed, defineComponent } from "vue";
import Home from "./pages/home/Home.vue";
import Login from "./pages/login/Login.vue";
import NotificationBanner from "./components/NotificationBanner.vue"
import { useStore } from "vuex";
import { key, store } from "./store/store";
import { RouterView } from "vue-router";
import { getUserByName } from "./api/user";
import { isAuthenticated, generateImageURL, handleHttpException, publishNotification } from "./utils/utils";
import { app, gameSocketIO, stateSocketIO } from "./main";

import { UserStateSocket } from "./utils/types";


export default defineComponent({
  name: "App",
  setup() {
    const store = useStore(key);
    const user = computed(() => store.state.user);
    const io = stateSocketIO();
    const auth = isAuthenticated();

    return {
      user,
      ioUserState: io,
      auth
    };
  },

  created() {
    this.notificationMessage = "message";
    this.isError = false;

    this.ioUserState.socket.offAny();
    if (this.user.id)
      this.ioUserState.socket.emit("alive", { userId: this.user.id });

    this.ioUserState.socket.on("user_states", (states: UserStateSocket[]) => {
      if (!states.find((s) => s.userId === this.user.id)) 
        if (this.user.id) 
          this.ioUserState.socket.emit("alive", { userId: this.user.id });
    })

    this.ioUserState.socket.on("who_is_alive", (payload: any) => {
      if (this.user.id)
        this.ioUserState.socket.emit("alive", { userId: this.user.id });
    })

    this.auth = isAuthenticated();
  },

  onmounted() {
    console.log("mounted");
    console.log(this.user);
    gameSocketIO().socket.on("matchmaking_canceled", (payload: {msg: string, isError: boolean}) => {
      publishNotification(payload.msg, payload.isError)
    });
    gameSocketIO().socket.on("game_start", (payload: {matchId: string}) => {
      this.$router.push("/game?id=" + payload.matchId);
    });
  },

  data() {
    return {
      searchUsername: "",
      notificationMessage: '',
      isError: false
    };
  },
  computed: {
    checkUser() {
      if (store.state.user)
        return true;
      return false;
    }
  },
  components: {
    Home,
    Login,
    NotificationBanner
  },
  methods: {
    searchFriend(username: string) {
      getUserByName(username)
        .then((response) => {
          window.location.href = `http://localhost:8080/user?uuid=${response.data.id}`;
        })
        .catch(err => handleHttpException(app, err))
    },
    modifyProfileRoute() {
      this.$router.push("/settings");
    },
    generateImageURL,
  }
});
</script>

<style>
.gradient-custom {
  position:relative;

  /* fallback for old browsers */
  background: #3609da;
  background-attachment: scroll;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(252, 253, 254));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(249, 251, 255));

}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.form-white.input-group>.form-control:focus {
  border-color: #fff;
  box-shadow: inset 0 0 0 1px #fff;
}


.navbar-dark .navbar-nav .nav-link:hover,
.navbar-dark .navbar-nav .nav-link:focus {
  color: rgba(255, 255, 255, 0.75);
}
</style>
