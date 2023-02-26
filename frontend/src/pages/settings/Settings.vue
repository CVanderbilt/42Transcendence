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
                  <img :src="getImgURL()" height="200" style="border-radius: 50%" />
                </div>
                <h2 class="fw-bold mt-1 mb-5 text-uppercase">Modify Profile</h2>

                <div class="form-outline form-white mb-2">
                  <input type="username" id="typeUsername" class="form-control form-control-lg"
                    :placeholder="user?.username" v-model="options.username" />
                  <label class="form-label" for="typeUsername">Username</label>
                </div>

                <div class="form-outline form-white mb-2">
                  <input type="file" ref="fileInput" accept="image/jpeg" />
                  <progress id="progress" value="0" max="100"></progress>
                </div>

                <div class="form-outline form-white mb-2">
                  <input type="checkbox" id="is2fa" class="form-check-input" v-model="options.is2fa" />
                  <label class="form-label" for="is2fa">Use 2 factor authentication</label>
                </div>

                <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click="submit()">
                  Change
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
import { IUser, key, store } from "../../store/store";
import { Buffer } from "buffer";
import { IUserAPI, updateUser } from "../..//api/user";

declare var require: any;

export default defineComponent({
  name: "Settings",
  setup() {
    const store = useStore(key);
    const user = computed(() => store.state.user);

    return {
      user
    };
  },
  data() {
    const options: IUserAPI = {
      username: "",
      email: "",
      password: "",
      is2fa: false,
    }
    return {
      options
    };
  },

  methods: {
    submit() {
      // alert("submitted!!")
      console.log("options:")
      console.log(this.options)
      console.log(store.state.user)

      if (!store.state.user) {
        console.error("no hay id y esta intentando modificar, no debería ni pasar");
        return;
      }
      // alert("update user info: " + this.options.username);

      // const input = this.$refs.fileInput as HTMLInputElement;

      // if (input.files) { // todo: extraer a funcion a parte
      //   const file: Blob = input.files[0];

      //   const fileReader = new FileReader();

      //   try {
      //     fileReader.readAsArrayBuffer(file);
      //   } catch (error) {
      //     alert(error);
      //   }


      //   fileReader.onload = () => {
      //     if (!store.state.user) {
      //       console.error("no hay id y esta intentando modificar, no debería ni pasar");
      //       return;
      //     }
      //     const buffer = Buffer.from(fileReader.result as ArrayBuffer);

      //     // addImage call would be here
      //   };
      // }

      // updateUser(store.state.user.id, this.options);

    },

    getImgURL(): string {
      return require(`@/assets/noPictureProfile.png`);
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
}
</style>
  