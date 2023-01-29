<template>
  <section class="vh-100 gradient-custom">
    <div>
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-0" style="color: white">CHAT</h1>

            <div class="row">
              <div class="col-xl-12">
                <div class="card mb-4">
                  <div class="card-header">
                    <i class="fas fa-chart-area me-1"></i>
                    Chat
                  </div>
                  <div class="card-body">
                    <p v-for="item in messages" v-bind:key="item.message">
                      {{ item.username + ": " + item.message }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="form-outline form-white mb-4">
                <input
                  type="username"
                  id="typeusernameX"
                  class="form-control form-control-lg"
                  v-on:keyup.enter="sendMessage()"
                  v-model="message"
                />
                <button v-on:click="sendMessage()">Mandar mensaje</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </section>
</template>
  
  <script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore, mapActions } from "vuex";
import { key, store } from "../store/store";
import "../style/styles.css";
import { useSocketIO } from "../main";
import axios from "axios";
declare var require: any;

export default defineComponent({
  name: "Chat",
  setup() {
    const store = useStore(key);
    const login = computed(() => store.state.login);
    const username = computed(() => store.state.username);
    const profilePicture = computed(() => store.state.pictureURL);

    return {
      login,
      username,
      profilePicture,
    };
  },
  data() {
    let message = "";
    let messages = [{ message: "hola", username: "holi" }];
    messages.pop();
    axios({
      method: "get",
      url: "http://localhost:3000/chats/7621715b-cda3-4a43-a880-d2f7de84caba",
      data: {},
    }).then((response) => {
      for (var i in response.data.messages) {
        messages.push(response.data.messages[i]);
      }
      this.$forceUpdate();
    });

    const io = useSocketIO();
    io.socket.emit("event_join", "primer chat");
    io.socket.on("new_message", (message, username) => {
      console.log(`${username} me ha mandado un mensaje!: ${message}`);
      if (username !== this.username) {
        messages.push({ message: message, username: username });
      }

      this.$forceUpdate();
    });
    return {
      message,
      messages,
      io,
    };
  },

  methods: {
    sendMessage() {
      this.io.socket.emit("event_message", {
        room: "primer chat",
        message: this.message,
        username: this.username,
      });
      //const postBody = JSON.stringify()
      this.messages.push({ message: this.message, username: this.username })
      
      console.log(JSON.stringify(this.messages))
      axios({
        method: "put",
        url: "http://localhost:3000/chats/7621715b-cda3-4a43-a880-d2f7de84caba",
        data: {
          chatname: "mi chat",
          password: "",
          messages: this.messages,
        },
      }).then((response) => {
        console.log(response);
      });
      this.$forceUpdate();
      this.message = "";
    },

    modifyProfileRoute() {
      this.$router.push("/settings");
    },
    getImgURL(profilePicture: string) {
      if (profilePicture === "") {
        return require(`@/assets/noPictureProfile.png`);
      }
      return profilePicture;
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