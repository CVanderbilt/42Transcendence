<template>
    <section class="vh-100 gradient-custom">
        
      <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-12 col-md-8 col-lg-6 col-xl-5">
            <div class="card bg-dark text-white" style="border-radius: 1rem">
              <div class="card-body p-5 text-center">
                <div class="mb-md-5 mt-md-4 pb-9">
                    <div
                  class="
                    d-flex
                    justify-content-center
                    text-center
                    mt-4
                    mb-5
                    pt-1
                  "
                >
                  <img :src="getImgURL(profilePicture)" height="200" 
                  style="border-radius: 50%"/>
                </div>
                  <h2 class="fw-bold mt-1 mb-5 text-uppercase">Modify Profile</h2>
  
                  <div class="form-outline form-white mb-2">
                    <input
                      type="username"
                      id="typeUsername"
                      class="form-control form-control-lg"
                      :placeholder="username"
                      v-model="newusername"
                    />
                    <label class="form-label" for="typeUsername">Username</label>
                  </div>
                  <div class="form-outline form-white mb-2">
                    <input
                      type="email"
                      id="typeEmailX"
                      class="form-control form-control-lg"
                      :placeholder="email"
                      v-model="newemail"
                    />
                    <label class="form-label" for="typeEmailX">Email</label>
                  </div>
  
                  <div class="form-outline form-white mb-2">
                    <input
                      type="password"
                      id="typePasswordX"
                      class="form-control form-control-lg"
                      placeholder="Type your new password"
                      v-model="password"
                    />
                    <label class="form-label" for="typePasswordX">New Password</label>
                  </div>
                  <div class="form-outline form-white mb-2">
                  <input type="file" accept="image/jpeg"/>
                  <progress id="progress"  value="0" max="100" ></progress>
                </div>
                
  
                  <button
                    class="btn btn-outline-light mt-3 btn-lg px-5"
                    type="submit"
                  >
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
  import { key, store } from "../store/store";
  import axios from "axios";
  
  declare var require: any;
  
  export default defineComponent({
    name: "Settings",
    setup() {
      const store = useStore(key);
      const login = computed(() => store.state.login);
      const username = computed(() => store.state.username);
      const profilePicture = computed(() => store.state.pictureURL);
      const email = computed(() => store.state.email);

  
      return {
        login,
        username,
        profilePicture,
        email
      };
    },
    data() {
      return {
        newusername: "",
        newemail: "",
        repeatedemail: "",
        password: "",
        apiData: null,
      };
    },

    methods: {
        getImgURL(profilePicture: string) {
      if (profilePicture === "") {
        return require(`@/assets/noPictureProfile.png`);
      }
      return profilePicture;
    },
    onUpload(){
        //const storageRef= storage.ref(`${this.imageData.name}`).put(this.imageData);
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
  