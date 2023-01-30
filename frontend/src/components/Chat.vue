<template>
  <section>
    <div class="vh-100 gradient-custom">
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-0" style="color: white">CHAT</h1>
            <div class="form-outline form-white mb-4">
              <input
                type="username"
                id="typeusernameX"
                class="form-control form-control-lg"
                v-model="searchedChat"
                placeholder="Chat name"
              />
              <button v-on:click="searchChat(searchedChat)">Search chat</button>
              <button v-on:click="createChat(searchedChat)">Create chat</button>
            </div>

            <div class="row">
              <div class="col-xl-12">
                <div class="card mb-7">
                  <div class="card-header">
                    <i class="fas fa-chart-area me-1"></i>
                    {{ chatname }}
                  </div>
                  <div
                    class="card-body"
                    style="height: 300px; overflow: scroll"
                  >
                    <div v-for="item in messages" v-bind:key="item.message">
                      <p
                        v-if="item.username === username"
                        style="text-align: right"
                      >
                        {{ "Me: " + item.message }}
                      </p>
                      <p
                        v-if="item.username !== username"
                        style="text-align: left"
                      >
                        {{ item.username + ": " + item.message }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-outline form-white mh-4">
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
          <div v-for="item in chatsFromUser" v-bind:key="item.name">
            <button v-on:click="searchChat(item.name)">{{ item.name }}</button>
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

export default defineComponent({
  name: "Chat",
  setup() {
    const store = useStore(key);
    const login = computed(() => store.state.login);
    const username = computed(() => store.state.username);
    const userUUID = computed(() => store.state.user_uuid);

    let chatUUID = "";
    return {
      login,
      username,
      chatUUID,
      userUUID,
    };
  },

  mounted() {
    if (this.$route.query.to !== undefined) {
      this.chatname = this.$route.query.to as string;
    } else {
      this.chatname = "general";
    }
  },

  data() {
    let searchedChat = "";
    let chatname = "general";
    let message = "";
    let messages = [{ message: "", username: "" }];
    let chatsFromUser = [{ name: "" }];
    messages.pop();
    chatsFromUser.pop();

    axios({
      method: "get",
      url: "http://localhost:3000/users/" + this.userUUID,
      data: {},
    }).then((response) => {
      for (var i in response.data.chats) {
        console.log(response.data.chats[i]);
        chatsFromUser.push(response.data.chats[i]);
      }
    });

    axios({
      method: "get",
      url: "http://localhost:3000/chatname/" + chatname,
      data: {},
    }).then((response) => {
      this.chatUUID = response.data;
      axios({
        method: "get",
        url: "http://localhost:3000/chats/" + response.data,
        data: {},
      }).then((response) => {
        for (var i in response.data.messages) {
          messages.push(response.data.messages[i]);
        }
        this.$forceUpdate();
      });
    });

    const io = useSocketIO();
    io.socket.emit("event_join", chatname);
    io.socket.on("new_message", (message, username) => {
      if (username !== this.username) {
        messages.push({ message: message, username: username });
      }
      this.$forceUpdate();
    });
    return {
      message,
      io,
      chatname,
      searchedChat,
      messages,
      chatsFromUser,
    };
  },

  methods: {
    sendMessage() {
      this.io.socket.emit("event_message", {
        room: this.chatname,
        message: this.message,
        username: this.username,
      });
      this.messages.push({ message: this.message, username: this.username });
      axios({
        method: "put",
        url: "http://localhost:3000/chats/" + this.chatUUID,
        data: {
          chatname: this.chatname,
          password: "",
          messages: this.messages,
        },
      })
        .then((response) => {
          this.$forceUpdate();
        })
        .catch((err) => {
          alert("Error sending the message. Try again later");
        });
      this.message = "";
    },

    searchChat(searchedChat: string) {
      axios({
        method: "get",
        url: "http://localhost:3000/chatname/" + searchedChat,
        data: {},
      })
        .then((response) => {
          this.chatUUID = response.data;
          axios({
            method: "get",
            url: "http://localhost:3000/chats/" + response.data,
            data: {},
          }).then((response) => {
            this.changeChat(this.chatUUID, searchedChat);
            if (
              this.chatsFromUser.find((str) => str.name === searchedChat) ===
              undefined
            ) {
              axios({
                method: "put",
                url: "http://localhost:3000/addChat/" + this.userUUID,
                data: { name: searchedChat },
              }).then(response => this.$forceUpdate());
              this.chatsFromUser.push({ name: searchedChat});
            }
            for (var i in response.data.messages) {
              this.messages.push(response.data.messages[i]);
            }
            this.$forceUpdate();
          });
        })
        .catch((error) => alert("No chats found with that name"));
    },

    changeChat(chatUUID: string, chatname: string) {
      this.chatUUID = chatUUID;
      this.io.socket.emit("event_leave", this.chatname);
      this.messages = [];
      this.io.socket.emit("event_join", chatname);
      this.chatname = chatname;
      this.io.socket.offAny();
      this.io.socket.on("new_message", (message, username) => {
        if (username !== this.username) {
          this.messages.push({ message: message, username: username });
        }
        this.$forceUpdate();
      });
    },

    createChat(chatName: string) {
      //console.log("UUID que llega"+  this.chatUUID)
      axios({
        method: "post",
        url: "http://localhost:3000/chats",
        data: {
          chatname: chatName,
          password: "",
          messages: "",
        },
      })
        .then((response) => {
          this.changeChat(response.data.id, chatName);
          this.chatsFromUser.push({ name: chatName });
          console.log(this.chatsFromUser);
          axios({
            method: "put",
            url: "http://localhost:3000/addChat/" + this.userUUID,
            data: { name: chatName },
          });
        })
        .catch((err) => {
          alert("Name already in use");
        });
    },

    modifyProfileRoute() {
      this.$router.push("/settings");
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