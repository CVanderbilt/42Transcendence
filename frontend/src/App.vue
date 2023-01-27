

<template>
  
    <div id="nav">
  
<!-- Navbar -->

      <router-view/>
  </div>

</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import Home from './components/Home.vue';
import Login from './components/Login.vue';
import { useStore } from 'vuex'
import { key, store } from './store/store'

export default defineComponent({
  name: 'App',
  setup () {
    const store = useStore(key)
    const login = computed(() => store.state.login);
    return{login} 
  },
  data()  {
    return {
      
    }
  },
  components: {
    Home,
    Login
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
.form-white.input-group>.form-control:focus {
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
