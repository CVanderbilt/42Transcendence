

<template>
  <div id="nav" class="gradient-custom">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" v-if=user>
      <div class="container-fluid">
        <a href="/"><img src="./assets/logo.png" height="30" style="margin-right: 20px ; border-radius: 10%" href="/"/></a>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
         
            <div style="width: 250px">
              <input
                type="search"
                class="form-control rounded"
                placeholder="Search friends..."
                aria-label="Search"
        
                v-model="searchUsername"
                v-on:keyup.enter="searchFriend(searchUsername)"
              />
            </div>
        
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" href="/chats">Chats</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/matchmaking">Game</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/friends">Friends</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Explore</a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" >{{ user.username }}</a>
            </li>
            <img
              :src="generateImageURL()"
              class="rounded-circle"
              height="40
                "
              style="border-radius: 50%"
              alt=""
              loading="lazy"
            />
          </ul>

          <ul class="navbar-nav d-flex flex-row ms-1 me-45">
            <b-dropdown
              id="dropdown-1"
              right
              text="Profile"
              class="m-md-2"
              variant="light"
            >
              <b-dropdown-item v-on:click="modifyProfileRoute()">Modify Profile</b-dropdown-item>
              <b-dropdown-item>Another Action</b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item href="/login" v-on:click="logOut()">Logout</b-dropdown-item>
            </b-dropdown>
          </ul>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import Home from "./pages/home/Home.vue";
import Login from "./pages/login/Login.vue";
import { useStore } from "vuex";
import { key, store } from "./store/store";
import { BDropdown, BDropdownItem, BDropdownDivider } from "bootstrap-vue-3";
import { RouterView } from "vue-router";
import { getUserByName } from "./api/user";
import { generateImageURL } from "./utils/utils";
declare var require: any;

export default defineComponent({
  name: "App",
  setup() {
    const store = useStore(key);
    const user = computed(() => store.state.user);
    
    return {
      user
    };
  },
  data() {
    return {searchUsername: ""};
  },
  components: {
    Home,
    Login,
  },
  methods: {
    searchFriend(username: string){ //todo: update para usar apis
      getUserByName(username)
        .then((response) => {
          this.$router.push("/user?uuid=" + response.data.id);
        })
        .catch((error) => {
          alert("usuario o contraseña incorrectos");
        });
    },
    modifyProfileRoute() {
      this.$router.push("/settings");
    },
    generateImageURL,
    logOut() {
      this.$router.push("/login");
      store.commit("changeUser", undefined)
      localStorage.removeItem("token");
    },
  }
});
</script>

<style>
.gradient-custom {
  /* fallback for old browsers */
  background: #3609da;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(
    to right,
    rgba(4, 8, 22, 0.804),
    rgb(193, 209, 237)
  );

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(
    to right,
    rgba(4, 8, 22, 0.804),
    rgb(193, 209, 237)
  );
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
.form-white.input-group > .form-control:focus {
  border-color: #fff;
  box-shadow: inset 0 0 0 1px #fff;
}

.navbar-dark .navbar-nav .nav-link {
  color: #fff;
}

.navbar-dark .navbar-nav .nav-link:hover,
.navbar-dark .navbar-nav .nav-link:focus {
  color: rgba(255, 255, 255, 0.75);
}
</style>
