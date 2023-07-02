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
          // localStorage.setItem("token", response.data.token)
          store.state.token = response.data.token

          if (response.data.is2fa) {
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
            this.DoLogin(user)
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
          // localStorage.setItem("token", response.data.token)
          store.state.token = response.data.token
          console.log("guardando token: " + localStorage.getItem("token"))

          if (response.data.is2fa) {
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
            this.DoLogin(user)
          }
        }).catch(err => handleHttpException(app, err))
    },

    // Check token validity
    async tokenLogin() {
      if (store.state.token === null) {
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

          // localStorage.setItem("token", response.data.token)
          store.state.token = response.data.token;

          this.DoLogin(user)
        }).catch(error => {
          handleHttpException(app, error)
        })
    },

    DoLogin(user: any,) {
      console.log("DoLogin")
      this.io.socket.emit("alive", { userId: user.id });
      store.commit("changeUser", user)
      this.$router.push("/")
    
    }
  },


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
      height: 100%;
      background-attachment: fixed;
      background-repeat: no-repeat;
}
  .loginpos {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

</style>
