<template>
  <section  class="vh-100  loginpos">
    <div class="container">
      <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-9">
                <div class="d-flex justify-content-center text-center mt-4 mb-5 pt-1">
                  <img src="@/assets/logo.png" height="90" />
                </div>
                <h2 class="fw-bold mb-2 text-uppercase">FT_TRANSCENDENCE</h2>

                <div v-if="is2faCodeRequired.status === false">
                  <p class="text-white-50 mb-5">
                    Please enter your login and password
                  </p>

                  <div class="form-outline form-white mb-4">
                    <input type="email" id="emailX" class="form-control form-control-lg" required
                      v-on:keyup.enter="validateLogin()" v-model="email" />
                    <label class="form-label" for="emailX">Email</label>
                  </div>

                  <div class="form-outline form-white mb-4">
                    <input type="password" id="typePasswordX" class="form-control form-control-lg" required
                      v-on:keyup.enter="validateLogin()" v-model="password" />
                    <label class="form-label" for="typePasswordX">Password</label>
                  </div>

                  <div v-if="is2faCodeRequired.status === false">
                    <button class="btn btn-outline-light btn-lg px-5" type="submit" v-on:click="validateLogin()">
                      Login
                    </button>
                  </div>
                </div>

                <div v-if="is2faCodeRequired.status === true">
                  <form @submit.prevent="submit2faCode">
                    <div class="form-group">
                      <label for="code">Enter the code from your app:</label>
                      <input type="text" class="form-control" id="code" v-model="twoFactorCode" />
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
                  </form>
                </div>

              </div>

              <div>
                <div v-if="is2faCodeRequired.status === false">
                  <p class="small mb-5 pb-lg-2">
                    <a class="text-white-50" v-bind:href="login42page">Login with 42 user</a>
                  </p>
                </div>
                <p class="mb-0">
                  Don't have an account?
                  <a href="/signUp" class="text-white-50 fw-bold">Sign Up</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">

 /* eslint-disable */

 
import { defineComponent, reactive } from "vue";
import { IUser, store } from "../../store/store";
import { AUTHENTICATE_2FA_ENDPOINT, LOGIN_42_URL } from "@/config";
import { apiClient } from "@/api/baseApi";
import { elogin, get42Token } from "@/api/auth";
import { app, stateSocketIO } from "@/main";
import { handleHttpException, throwFromAsync } from "@/utils/utils";

export default defineComponent({
  name: "Login",

  data() {
    const io = stateSocketIO()
    return {
      username: "",
      email: "",
      password: "",
      code: "",
      login42page: LOGIN_42_URL,
      is2faEnabled: false,
      twoFactorCode: "",
      io,
    };
  },


  async mounted() {
    // comprueba si ya hay un token válido
    await this.tokenLogin()

    if (this.$route.query.expired !== undefined)
      throwFromAsync(app, "Token expired, you have to log in again")

    // comprueba si hay un codigo en la url
    if (this.$route.query.code) {
      console.log("42 url code: " + this.$route.query.code)
      this.code = this.$route.query.code as string
      await this.getToken(this.code)
      await this.tokenLogin()
    }
  },

  setup() {
    const io = stateSocketIO();
    const reactiveIs2fa = reactive({
      status: false
    })

    return {
      ioState: io,
      is2faCodeRequired: reactiveIs2fa,
    }
  },

  methods: {
    validateLogin() {
      const loginData = {
        email: this.email,
        password: this.password
      };
      elogin(loginData)
        .then((response) => {
          if (response.data.is2fa) {
            localStorage.setItem("token", response.data.token)
            this.is2faCodeRequired.status = true
          }
          else {
            const user: IUser = {
              id: response.data.userId,
              username: response.data.name,
              email: response.data.email,
              password: response.data.password,
              pic: response.data.pic,
              is2fa: response.data.is2fa,
              is2faEnabled: response.data.is2faEnabled || false,
              role: response.data.role,
              isBanned: response.data.isBanned,
            }
            this.DoLogin(user, response.data.token)
          }
        }).catch(err => handleHttpException(app, err))
    },

    // Exchange 42 code for JWT token
    async getToken(code: string) {
      console.log("Adquiriendo token con login de 42")
      var bodyFormData = new FormData();
      bodyFormData.append("code", code);
      get42Token(code)
        .then((response) => {
          console.log("guardando token: " + localStorage.getItem(response.data.userId))

          if (response.data.is2fa) {
            localStorage.setItem("token", response.data.token)
            this.is2faCodeRequired.status = true
          }
          else {
            const user: IUser = {
              id: response.data.userId,
              username: response.data.name,
              email: response.data.email,
              password: response.data.password,
              pic: response.data.pic,
              is2fa: response.data.is2fa,
              is2faEnabled: response.data.is2faEnabled || false,
              role: response.data.role,
              isBanned: response.data.isBanned
            }
            this.DoLogin(user, response.data.token, response.data.isNew)
          }
        }).catch(err => handleHttpException(app, err))
    },

    // Check token validity
    async tokenLogin() {
      if(localStorage.getItem(store.state.user.id)) {
        console.log("tokenLogin: token null")
        return
      }
      // if (localStorage.getItem("token") === null) {
      //   return
      // }
    },

    async submit2faCode() {
      console.log("submitCode: " + this.twoFactorCode + "")
      apiClient.post(`${AUTHENTICATE_2FA_ENDPOINT}/${this.twoFactorCode}`)
        .then(response => {
          const user: IUser = {
            id: response.data.userId,
            username: response.data.name,
            email: response.data.email,
            password: "",
            pic: response.data.pic,
            is2fa: response.data.is2fa,
            is2faEnabled: this.is2faEnabled,
            role: response.data.role,
            isBanned: response.data.isBanned
          }

          this.DoLogin(user, response.data.token)
        }).catch(error => {
          handleHttpException(app, error)
        })
    },

    DoLogin(user: any, token: string, isNew = false) {
      this.io.socket.emit("alive", { userId: user.id });
      localStorage.setItem(user.id, token)
      localStorage.setItem("token", token)
      store.commit("changeUser", user)
      if (isNew)
        this.$router.push("/settings")
      else
        this.$router.push("/")
    
    }
  },


});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.gradient-custom {
}
  .loginpos {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

</style>
