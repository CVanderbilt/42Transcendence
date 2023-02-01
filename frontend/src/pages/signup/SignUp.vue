<template>
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-9">
                <div
                  class="d-flex justify-content-center text-center mt-4 pt-1"
                >
                  <img src="@/assets/logo.png" height="90" />
                </div>
                <h2 class="fw-bold mt-5 mb-2 text-uppercase">Sign Up</h2>
                <p class="text-white-50 mb-5">
                  Please register yourself in ft_transcendence!
                </p>

                <div class="form-outline form-white mb-2">
                  <input
                    type="username"
                    id="typeUsername"
                    class="form-control form-control-lg"
                    v-model="username"
                  />
                  <label class="form-label" for="typeUsername">Username</label>
                </div>
                <div class="form-outline form-white mb-2">
                  <input
                    type="email"
                    id="typeEmailX"
                    class="form-control form-control-lg"
                    v-model="email"
                  />
                  <label class="form-label" for="typeEmailX">Email</label>
                </div>
                <div class="form-outline form-white mb-2">
                  <input
                    type="repemail"
                    id="typeRepEmailX"
                    class="form-control form-control-lg"
                    v-model="repeatedemail"
                  />
                  <label class="form-label" for="typeRepEmailX"
                    >Repeat Email</label
                  >
                </div>

                <div class="form-outline form-white mb-2">
                  <input
                    type="password"
                    id="typePasswordX"
                    class="form-control form-control-lg"
                    v-model="password"
                  />
                  <label class="form-label" for="typePasswordX">Password</label>
                </div>

                <button
                  class="btn btn-outline-light mt-3 btn-lg px-5"
                  type="submit"
                  v-on:click="signUpNewUser()"
                >
                  Sign Up
                </button>
              </div>
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
//import { hashPassword } from "@/utils/utils";
import { IUser, key, store } from "../../store/store";
import { createUser, } from "../..//api/user";

export default defineComponent({
  name: "SignUp",
  setup() {
    const store = useStore(key);
    const user = computed(() => store.state.user);

    return {
      user,
    };
  },
  data() {
    return {
      username: "",
      email: "",
      repeatedemail: "",
      password: "",
      apiData: null,
    };
  },

  methods: {
    signUpNewUser() {
      if (this.email === this.repeatedemail) {
        createUser({
          username: this.username,
          password: this.password,
          email: this.email
        })
        .then((response) => {
          console.log(response.data);
          const user: IUser = {
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            password: this.password
          }
          store.commit("changeUser", user);
          this.$router.push("/");
        }).catch(error => alert("username already in use"));
        
      } else {
        alert("email and repeated email are not the same");
      }
    },
    ...mapActions(["mockLogin"]),
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
</style>
