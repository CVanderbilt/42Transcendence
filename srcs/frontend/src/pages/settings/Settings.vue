<template>
  <section>
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem">
            <div class="card-body p-5 text-center">
              <div class="
                  d-flex
                  justify-content-center
                  text-center
                  mt-4
                  mb-5
                  pt-1
                ">
                <img :src="generateImageURL()" height="200" style="border-radius: 50%" />
              </div>
              <h2 class="fw-bold mt-1 mb-5 text-uppercase">Modify Profile</h2>

              <div class="form-outline form-white mb-2">
                <input type="username" id="typeUsername" class="form-control form-control-lg"
                  :placeholder="user!.username" v-model="options.username" />
                <label class="form-label" for="typeUsername">Nickname</label>
              </div>


              <div class="form-outline form-white mb-2">
                <input type="file" ref="fileInput" accept="image/jpeg" @change="uploadImage" />
              </div>

              <div class="form-outline form-white mb-2" style="margin-top: 20px;">
                <input type="checkbox" id="is2fa" class="form-check-input" v-model="is2fa" />
                <label class="form-label" for="is2fa">Use 2 factor authentication</label>
              </div>

              <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click="submit()">
                Change
              </button>
            </div>
            <button class="btn btn-outline-light mt-3 btn-lg px-5" v-on:click="logOut()">Logout</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">

/* eslint-disable */

import { computed, defineComponent, handleError } from "vue";
import { useStore } from "vuex";
import { key, store } from "../../store/store";
import { generateImageURL, handleHttpException, publishNotification } from "@/utils/utils";
import { IUserAPI, putImage, updateUserReq } from "@/api/user";
import { app, stateSocketIO } from "@/main";
import User from "@/components/User.vue";

export default defineComponent({
  name: "Settings",
  setup() {
    const store = useStore(key);
    const user = computed(() => store.state.user);
    const io = stateSocketIO()

    return {
      user,
      io,
    };
  },
  data() {
    const options: IUserAPI = {
      username: '',
    }

    var selectedFile: File | undefined
    return {
      options,
      selectedFile,
      is2fa: false,
    };
  },

  mounted() {
    this.options.username = this.user.username as string
    this.is2fa = this.user?.is2fa
  },

  methods: {
    async submit() {
      if (!store.state.user) {
        console.error("Something went wrong, logout and login again");
        return;
      }

      if (!this.is2fa)
        this.options.is2fa = false

      try {
        await (await updateUserReq(store.state.user.id, this.options)).data
        publishNotification("User updated", false)
      }
      catch (error: any) {
        handleHttpException(app, error)
        return
      }

      store.commit("changeUserName", this.options.username)

      if (this.selectedFile) {
        try {
          await putImage(store.state.user.id, this.selectedFile)
        } catch (error) {
          handleHttpException(app, error)
        }
      }
      

      // user means to activate 2fa
      if (this.is2fa && !store.state.user.is2faEnabled)
      setTimeout(() => {
          window.location.href = "/qr";
        }, 500);
        // this.$router.push("/qr");
      else
      {
        // page reload
        if (store.state.user.is2fa && !this.is2fa){

      localStorage.removeItem(store.state.user.id);
      localStorage.removeItem("token")
      store.commit("logout");

      this.io.socket.offAny();

      this.$router.push("/login");
      console.log("Bye bye");

      //espera 500ms
      setTimeout(() => {
        this.io.socket.emit("logout");
      }, 500);
        }
        setTimeout(() => {
          window.location.reload()
        }, 500);
      }
    },

    generateImageURL,
    uploadImage(event: Event) {
      const input = event.target as HTMLInputElement;
      this.selectedFile = input.files![0]
    },

    logOut() {
      if (store.state.user.is2fa == this.is2fa)
      { 
      localStorage.removeItem(store.state.user.id);
      localStorage.removeItem("token")
      store.commit("logout");

      this.io.socket.offAny();

      this.$router.push("/login");
      console.log("Bye bye");

      //espera 500ms
      setTimeout(() => {
        this.io.socket.emit("logout");
      }, 500);
    }
    },
  }
})
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
