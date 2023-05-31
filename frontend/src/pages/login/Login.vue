<template>
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
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
                    <input type="email" id="emailX" class="form-control form-control-lg"
                      v-on:keyup.enter="validateLogin()" v-model="email" />
                    <label class="form-label" for="emailX">Email</label>
                  </div>

                  <div class="form-outline form-white mb-4">
                    <input type="password" id="typePasswordX" class="form-control form-control-lg"
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
import { publishNotification } from "@/utils/utils";

export default defineComponent({
  name: "Login",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      code: "",
      login42page: LOGIN_42_URL,
      is2faEnabled: false,
      twoFactorCode: ""
    };
  },
  async mounted() {
    // comprueba si ya hay un token válido
    await this.tokenLogin()

    // comprueba si hay un codigo en la url
    if (this.$route.query.code) {
      console.log("existe code: " + this.$route.query.code)
      this.code = this.$route.query.code as string
      await this.getToken(this.code)
      await this.tokenLogin()
    }
  },

  setup() {
    const reactiveIs2fa = reactive({
      status: false
    })

    return {
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
                role: response.data.role,
                isBanned: response.data.isBanned
              }
              store.commit("changeUser", user)

              localStorage.setItem("token", response.data.token)
              console.log("regular token: " + localStorage.getItem("token"))

              this.$router.push("/");
            }
        })
    },

    // Cambia el codigo de 42 por el JWT token y los datos de usuario
    async getToken(code: string) {
      console.log("Adquiriendo token con login de 42")
      var bodyFormData = new FormData();
      bodyFormData.append("code", code);
      try {
        const response = await get42Token(code)
        console.log("response: " + { response })

        if (response.status !== 201) {
          console.log("Failed logging in with server: " + response.status)
          return
        }

        localStorage.setItem("token", response.data.token)
        console.log("regular token: " + localStorage.getItem("token"))

        this.is2faCodeRequired.status = response.data.is2fa
        console.log("is2faCodeRequired.status: " + this.is2faCodeRequired.status)

        console.log("userId: " + response.data.userId);

        const user: IUser = {
          id: response.data.userId,
          email: "",
          password: "",
          username: response.data.name,
          pic: response.data.pic,
          is2fa: response.data.is2fa,
          role: response.data.role,
          isBanned: response.data.isBanned
        }
        store.commit("changeUser", user)
      }
      catch (error) {
        console.log("Get token: " + error)
      }
    },

    // Si existe token pedimos los datos de usuario al servidor y los guardamos
    async tokenLogin() {
      // comprueba si ya hay un token en el local storage y si es valido
      console.log(localStorage.getItem("token"))
      if (localStorage.getItem("token") === null) {
        console.log("Token login: No token found")
        return
      }

      try {
        await apiClient.get("/auth/me").then((response) => {
          if (response.status === 401) {
            console.log("Token login: Invalid token")
            return
          }
          if (response.status !== 200) {
            console.log("Token login: Error getting user data")
            return
          }
          console.log("You are in")
          this.$router.push("/")
        })
      }
      catch (error) {
        console.log("Token login: " + error)
      }
    },

    async submit2faCode() {
      console.log("submitCode: " + this.twoFactorCode + "")
      try {

        //Validate the user's code and redirect them to the appropriate page
        const response = await apiClient.post(AUTHENTICATE_2FA_ENDPOINT + "/" + this.twoFactorCode)
        if (response.status === 200) {
          const user: IUser = {
            id: response.data.userId,
            username: response.data.name,
            email: response.data.email,
            password: response.data.password,
            pic: response.data.pic,
            is2fa: response.data.is2fa,
            role: response.data.role,
            isBanned: response.data.isBanned
          }
          store.commit("changeUser", user)

          console.log("2fa token: " + localStorage.getItem("token"))
          localStorage.setItem("token", response.data.token)
          this.tokenLogin()
        }
      } catch (error: any) {
        if (error.response.status === 401) {
          alert('Invalid code, please try again.')
        }
        else {
          alert('Something went wrong, please try again.')
        }
        console.log(error.name + ": " + error.message)
      }
    },
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
}
</style>
