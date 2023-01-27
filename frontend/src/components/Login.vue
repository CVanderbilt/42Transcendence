<template>
  <section class="vh-100 gradient-custom">
  <div class="container py-5 h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-12 col-md-8 col-lg-6 col-xl-5">
        <div class="card bg-dark text-white" style="border-radius: 1rem;">
          <div class="card-body p-5 text-center">

            <div class="mb-md-5 mt-md-4 pb-9">
              <div class="d-flex justify-content-center text-center mt-4 mb-5 pt-1">
                <img src="../assets/logo.png" height="90"/>
              </div>
              <h2 class="fw-bold mb-2 text-uppercase">FT_TRANSCENDENCE</h2>
              <p class="text-white-50 mb-5">Please enter your login and password!</p>

              <div class="form-outline form-white mb-4">
                <input type="username" id="typeusernameX" class="form-control form-control-lg" v-on:keyup.enter=validateLogin() v-model="username"/>
                <label class="form-label" for="typeusernameX">Username</label>
              </div>

              <div class="form-outline form-white mb-4">
                <input type="password" id="typePasswordX" class="form-control form-control-lg" v-on:keyup.enter=validateLogin() v-model="password"/>
                <label class="form-label" for="typePasswordX">Password</label>
              </div>

              <p class="small mb-5 pb-lg-2"><a class="text-white-50" href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-8b7831bc16e1b149ccb268da713c3705b61d3f9728492946634a9ba532d731fe&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Flogin&response_type=code" >Login with 42 user</a></p>

              <button class="btn btn-outline-light btn-lg px-5" type="submit" v-on:click=validateLogin() >Login</button>

              

            </div>

            <div>
              <p class="mb-0">Don't have an account? <a href="/signUp" class="text-white-50 fw-bold">Sign Up</a>
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
import { computed, defineComponent } from 'vue';
import { useStore, mapActions } from 'vuex'
import { key, store } from '../store/store'
import axios from 'axios'
import { anyTypeAnnotation } from '@babel/types';


export default defineComponent({
  name: 'Login',
  setup () {
    const store = useStore(key)
    const login = computed(() => store.state.login);
    return{
      login
    }

  },
  data()  { 
    return {
      username: "",
      password: "",
      info: "" as any,
      data: {
        username: ""
      },
      code: "",
      apiToken: "",
      profilepicture: ""
    }
  },
  mounted() {
    if(this.$route.query.code !== undefined){
      this.code = this.$route.query.code as string;
      this.getSessionToken()
      this.axiosGetUserData()
    }
  },

  methods: {
    getSessionToken() {
      console.log(this.code)
      var bodyFormData = new FormData();
      bodyFormData.append('grant_type', 'authorization_code');
      bodyFormData.append('client_id', 'u-s4t2ud-8b7831bc16e1b149ccb268da713c3705b61d3f9728492946634a9ba532d731fe');
      bodyFormData.append('client_secret', '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');
      bodyFormData.append('code', this.code);
      bodyFormData.append('redirect_uri', 'http://localhost:8080/login');
       axios({
        method: "post",
        url: "https://api.intra.42.fr/oauth/token",
        data: bodyFormData,
        headers: { "content-type": "application/x-www-form-urlencoded" },
      }).then(response => {
        console.log("token de acceso: " + response.data.access_token)
        axios({
        method: "get",
        url: "https://api.intra.42.fr/v2/me",
        headers: {  Authorization: 'Bearer ' + response.data.access_token},
      }).then(response => {

        store.commit('changeLogin')
        store.commit('changeUsername', response.data.login)
        store.commit('changePicture', response.data.image.link)
        store.commit('changeEmail', response.data.email)
        this.$router.push('/')
      })
      })
      
      
    },
    axiosGetUserData() {
      //console.log("token: " + this.apiToken)
      /**/
  },
    validateLogin(){
        //aqui va a ir la validación en servidor del login
        store.commit('changeLogin')
        store.commit('changeUsername', this.username)
        this.$router.push('/')
        
    },
    ...mapActions([
      'mockLogin'
    ])
}});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.gradient-custom {
/* fallback for old browsers */
background: #3609da;

/* Chrome 10-25, Safari 5.1-6 */
background: -webkit-linear-gradient(to right, rgba(4, 8, 22, 0.804), rgb(193, 209, 237));

/* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
background: linear-gradient(to right, rgba(4, 8, 22, 0.804), rgb(193, 209, 237))
}
</style>
