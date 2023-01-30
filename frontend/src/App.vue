

<template>
  <div id="nav" class="gradient-custom">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark" v-if=login>
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
              <a class="nav-link" href="#">Game</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Friends</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Explore</a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" >{{ username }}</a>
            </li>
            <img
              :src="getImgURL(profilePicture)"
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
              <b-dropdown-item v-on:click="logOut()">Logout</b-dropdown-item>
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
import Home from "./components/Home.vue";
import Login from "./components/Login.vue";
import { useStore } from "vuex";
import { key, store } from "./store/store";
import axios from "axios";
declare var require: any;

export default defineComponent({
  name: "App",
  setup() {
    const store = useStore(key);
    const login = computed(() => store.state.login);
    const username = computed(() => store.state.username);
    const profilePicture = computed(() => store.state.pictureURL);
    return { login,
    username,
  profilePicture };
  },
  data() {
    return {searchUsername: ""};
  },
  components: {
    Home,
    Login,
  },
  methods: {
    searchFriend(username: string){
      axios({
      method: "get",
        url: "http://localhost:3000/username/" + username,
        data: {},
      })
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
    getImgURL(profilePicture: string) {
      if (profilePicture === "") {
        return require(`@/assets/noPictureProfile.png`);
      }
      return profilePicture;
    },
    logOut() {
      store.commit("changeLogin");
      store.commit("changeUsername");
      store.commit("changePicture", "");
      this.$router.push("/login");
    }
  }
});
</script>

<style>
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
