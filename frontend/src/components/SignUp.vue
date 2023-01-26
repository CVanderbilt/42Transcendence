<template>
  <section class="vh-100 gradient-custom">
  <div class="container py-5 h-100">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-12 col-md-8 col-lg-6 col-xl-5">
        <div class="card bg-dark text-white" style="border-radius: 1rem;">
          <div class="card-body p-5 text-center">

            <div class="mb-md-5 mt-md-4 pb-9">
              <div class="d-flex justify-content-center text-center mt-4 pt-1">
                <img src="../assets/logo.png" height="90"/>
              </div>
              <h2 class="fw-bold mt-5 mb-2 text-uppercase">Sign Up</h2>
              <p class="text-white-50 mb-5">Please register yourself in ft_transcendence!</p>

              <div class="form-outline form-white mb-2">
                <input type="username" id="typeUsername" class="form-control form-control-lg" v-model="username"/>
                <label class="form-label" for="typeUsername">Username</label>
              </div>
              <div class="form-outline form-white mb-2">
                <input type="email" id="typeEmailX" class="form-control form-control-lg" v-model="email"/>
                <label class="form-label" for="typeEmailX">Email</label>
              </div>
              <div class="form-outline form-white mb-2">
                <input type="repemail" id="typeRepEmailX" class="form-control form-control-lg" v-model="repeatedemail"/>
                <label class="form-label" for="typeRepEmailX">Repeat Email</label>
              </div>

              <div class="form-outline form-white mb-2">
                <input type="password" id="typePasswordX" class="form-control form-control-lg" v-model="password"/>
                <label class="form-label" for="typePasswordX">Password</label>
              </div>

              <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click=validateLogin() >Sign Up</button>

              

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


export default defineComponent({
  name: 'SignUp',
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
      email: "",
      repeatedemail: "",
      password: "",
      apiData: null
    }
  },
  mounted() {
    if(this.$route.query.code !== undefined){
    axios.defaults.headers.common['Authorization'] = `Bearer 983b0643f927fe97d502bba82f3a62ab5bb8c23e743e9ebc8a35d3b45ab2511b`;
    axios.get('https://api.intra.42.fr/v2/me').then(response => 
      {this.username = response.data.login, this.email = response.data.email, this.repeatedemail = response.data.email} 
      )
    }
  },

  methods: {
    reviewFields(){
      console.log(this.email, this.password)
      store.commit('changeLogin')
      this.$router.push('/')
      //this.login = true
    },
    validateLogin(){
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
background: -webkit-linear-gradient(to right, rgb(37, 12, 179), rgba(3, 50, 130, 0.632));

/* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
background: linear-gradient(to right, rgb(24, 3, 129), rgb(193, 209, 237))
}
</style>
