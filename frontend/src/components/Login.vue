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
                <input type="username" id="typeusernameX" class="form-control form-control-lg" v-model="username"/>
                <label class="form-label" for="typeusernameX">Username</label>
              </div>

              <div class="form-outline form-white mb-4">
                <input type="password" id="typePasswordX" class="form-control form-control-lg" v-model="password"/>
                <label class="form-label" for="typePasswordX">Password</label>
              </div>

              <p class="small mb-5 pb-lg-2"><a class="text-white-50" href="#!">Forgot password?</a></p>

              <button class="btn btn-outline-light btn-lg px-5" type="submit" v-on:click=validateLogin() >Login</button>

              

            </div>

            <div>
              <p class="mb-0">Don't have an account? <a href="#/signUp" class="text-white-50 fw-bold">Sign Up</a>
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
      password: ""  
    }
  },

  methods: {
    reviewFields(){
      console.log(this.username, this.password)
      
      this.$router.push('/')
      //this.login = true
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
background: -webkit-linear-gradient(to right, rgb(37, 12, 179), rgba(3, 50, 130, 0.632));

/* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
background: linear-gradient(to right, rgb(24, 3, 129), rgb(193, 209, 237))
}
</style>
