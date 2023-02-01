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
                        v-if="item.username === user?.username"
                        style="text-align: right"
                      >
                        {{ "Me: " + item.message }}
                      </p>
                      <p
                        v-if="item.username !== user?.username"
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
import { key, store } from "@/store/store";
import "@/style/styles.css";
import { useSocketIO } from "@/main";
import { getChatById, IMessage, newChat, updateChat } from "@/api/chat";
import { getChat } from "@/api/chatname";

declare var require: any;

export default defineComponent({
  name: "Chat",
  setup() {
    const store = useStore(key);
    const user = store.state.user;

    let chatUUID = "";
    return {
      chatUUID,
      user,
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
    let messages: IMessage[] = [{ message: "hola", username: "holi" }];
    let chatsFromUser = [{ name: "" }];
    messages.pop();
    chatsFromUser.pop();
    getChatById("7621715b-cda3-4a43-a880-d2f7de84caba")
    .then((response) => {
      for (var i in response.data.chats) {
        console.log(response.data.chats[i]);
        chatsFromUser.push(response.data.chats[i]);
      }
    });

    getChat(chatname)
    .then((response) => {
      this.chatUUID = response.data;
      getChatById(response.data)
      .then((response) => {
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
      if (!this.user) {
        console.error("user not defined, esto no deberia pasar");
        return;
      }
      this.io.socket.emit("event_message", {
        room: this.chatname,
        message: this.message,
        username: this.user.username
      });
      this.messages.push({ message: this.message, username: this.user.username });
      updateChat(this.chatUUID, {
        chatname: this.chatname,
        password: "",
        messages: this.messages
      })
      .then((response) => {
        this.$forceUpdate();
      })
      .catch((err) => {
        alert("Error sending the message. Try again later");
      });
      this.message = "";
    },

    //todo: move to api, tambien move estos methods a un fichero aparte en este directorio
    searchChat(searchedChat: string) {
      if (!this.user) return;
      const UUID = this.user.id;
      getChat(searchedChat)
      .then((response) => {
        this.chatUUID = response.data;
        getChatById(this.chatUUID)
        .then((response) => {
          this.changeChat(this.chatUUID, searchedChat);
          if (
            this.chatsFromUser.find((str) => str.name === searchedChat) ===
            undefined
          ) {
            updateChat(UUID, {
              chatname: searchedChat,
              password: "",
              messages: []
            })
            .then(response => this.$forceUpdate());
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
      if (!this.user) return;
      const username = this.user.username;
      this.chatUUID = chatUUID;
      this.io.socket.emit("event_leave", this.chatname);
      this.messages = [];
      this.io.socket.emit("event_join", chatname);
      this.chatname = chatname;
      this.io.socket.offAny();
      this.io.socket.on("new_message", (message, username) => {
        if (username !== username) {
          this.messages.push({ message: message, username: username });
        }
        this.$forceUpdate();
      });
    },

    createChat(chatName: string) {
      //console.log("UUID que llega"+  this.chatUUID)
      if (!this.user) return;
      const UUID = this.user.id
      newChat({
        chatname: chatName,
        password: "",
        messages: []
      })
      .then((response) => {
        this.changeChat(response.data.id, chatName);
        this.chatsFromUser.push({ name: chatName });
        console.log(this.chatsFromUser);
        updateChat(UUID, {
          chatname: chatName,
          password: "",
          messages: []
        })
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