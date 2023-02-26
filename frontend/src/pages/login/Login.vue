<template>
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-9">
                <div class="
                                  d-flex
                                  justify-content-center
                                  text-center
                                  mt-4
                                  mb-5
                                  pt-1
                                ">
                  <img src="@/assets/logo.png" height="90" />
                </div>
                <h2 class="fw-bold mb-2 text-uppercase">FT_TRANSCENDENCE</h2>
                <!-- <p class="text-white-50 mb-5">
                  Please enter your login and password!
                </p> -->

                <!-- <div class="form-outline form-white mb-4">
                  <input type="username" id="typeusernameX" class="form-control form-control-lg"
                    v-on:keyup.enter="validateLogin()" v-model="username" />
                  <label class="form-label" for="typeusernameX">Username</label>
                </div>

                <div class="form-outline form-white mb-4">
                  <input type="password" id="typePasswordX" class="form-control form-control-lg"
                    v-on:keyup.enter="validateLogin()" v-model="password" />
                  <label class="form-label" for="typePasswordX">Password</label>
                </div> -->

                <p class="small mb-5 pb-lg-2">
                  <a class="text-white-50" v-bind:href="login42page">Login with 42 user</a>
                </p>

                <!-- <button class="btn btn-outline-light btn-lg px-5" type="submit" v-on:click="validateLogin()">
                  Login
                </button> -->
              </div>
<!-- 
              <div>
                <p class="mb-0">
                  Don't have an account?
                  <a href="/signUp" class="text-white-50 fw-bold">Sign Up</a>
                </p>
              </div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore, mapActions } from "vuex";
import { IUser, key, store } from "../../store/store";
import axios from "axios";
import { anyTypeAnnotation } from "@babel/types";
import { getUser } from "../../api/username";
import { createUser } from "../../api/user";
import { login42url } from "@/config";
import { apiClient } from "@/api/baseApi";
import { ConstantTypes } from "@vue/compiler-core";

export default defineComponent({
  name: "Login",
  data() {
    return {
      username: "",
      password: "",
      code: "",
      login42page: login42url,
    };
  },
  async mounted() {
    console.log("login mounted")


    // comprueba si hay un codigo en la url
    if (this.$route.query.code) {
      console.log("existe code: " + this.$route.query.code)
      this.code = this.$route.query.code as string;
      this.loginWithServer(this.code)
        .then(() => this.checkToken())
        .then(() => {
          this.$router.push("/");
        });
    }
  },

  methods: {

    // Cambia el codigo de 42 por el JWT token y los datos de usuario
    async loginWithServer(code: string) {
      try {
        // adquiere el token
        console.log("Adquiriendo token")
        var bodyFormData = new FormData();
        bodyFormData.append("code", code);
        await axios({
          method: "post",
          url: "http://localhost:3000/auth/login",
          data: bodyFormData,
          headers: { "content-type": "application/json" }, // Al mandarlo como JSON lo podemos recibir directamente en el backend
        }).then((response) => {
          console.log({ response })
          localStorage.setItem("token", response.data.token)
  
          const user: IUser = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            password: "",
  
            pic: response.data.pic,
          }
          store.commit("changeUser", user)
        })
      } catch (error) {
        console.log("Failed logging in with server: " + error)
      }
    },

    // Si existe token pedimos los datos de usuario al servidor y los guardamos
    checkToken() {
      // comprueba si ya hay un token en el local storage y si es valido
      console.log(localStorage.getItem("token"))
      if (localStorage.getItem("token") === null) {
        alert("Token not found. Log in again")
        return
      }

      console.log("existe token: " + localStorage.getItem("token"))
      console.log("Validando token")
      try {
        apiClient.get("/auth/me")
      }
      catch(error)
      {
        console.log("Token is invalid :" + error)
      }
    },
  }

  // getSessionToken() {
  //   console.log("code: " + this.code);
  //   var bodyFormData = new FormData();
  //   bodyFormData.append("grant_type", "authorization_code");
  //   bodyFormData.append("client_id", client_id);
  //   bodyFormData.append("client_secret", client_secret);
  //   bodyFormData.append("code", this.code);
  //   bodyFormData.append("redirect_uri", redirect_uri);
  //   axios({
  //     method: "post",
  //     url: "https://api.intra.42.fr/oauth/token",
  //     data: bodyFormData,
  //     headers: { "content-type": "application/x-www-form-urlencoded" },
  //   })
  //     .then((response) => {
  //       axios({
  //         method: "get",
  //         url: "https://api.intra.42.fr/v2/me",
  //         headers: { Authorization: "Bearer " + response.data.access_token },
  //       }).
  //         then((response) => {
  //           createUser({
  //             username: response.data.login,
  //             password: "",
  //             email: response.data.email,
  //           })
  //             .then((response) => {
  //               const user: IUser = {
  //                 id: response.data.id,
  //                 username: response.data.username,
  //                 email: response.data.email,
  //                 password: ""
  //               }
  //               store.commit("changeUser", user)
  //               store.commit("setupChats", response.data.chats)
  //               this.$router.push("/");
  //             })
  //             .catch((error) => {
  //               getUser(response.data.login).then(response => {
  //                 const user: IUser = {
  //                   id: response.data.id,
  //                   username: response.data.username,
  //                   email: response.data.email,
  //                   password: ""
  //                 }
  //                 store.commit("changeUser", user)
  //                 store.commit("setupChats", response.data.chats)
  //                 this.$router.push("/");
  //               })
  //             });
  //         });
  //     });
  // },

  // validateLogin() {
  //   getUser(this.username)
  //     .then((response) => {
  //       if (response.data.password === this.password) {
  //         const user: IUser = {
  //           id: response.data.id,
  //           username: response.data.username,
  //           email: response.data.email,
  //           password: response.data.password
  //         }
  //         store.commit("changeUser", user)
  //         store.commit("setupChats", response.data.chats)

  //         this.$router.push("/");
  //       }
  //       else {
  //         throw ("ERROR contraseña incorrecta")
  //       }
  //     })
  //     .catch((error) => {
  //       alert("usuario o contraseña incorrectos");
  //     });
  // },
  // ...mapActions(["mockLogin"]),
  // },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.gradient-custom {
  /* fallback for old browsers */
  background: #3609da;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(193, 209, 237));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(193, 209, 237));
}
</style>
