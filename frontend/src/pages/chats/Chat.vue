<template>
  <section>
    <div class="background">
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-0" style="color: white">CHAT</h1>
    
            <div class="row chats-window">
              <div class="col chats-list">
                <div v-for="item in chatsFromUser" v-bind:key="item.name">
                  <b-button
                    v-on:click="searchChat(item.name)"
                    style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;"
                  >
                    {{ getNameDirectMessage(item.name) }}
                  </b-button>
                </div>
              </div>
              <div class="col-9 chat-column">
                <div class="chat-header">
                  {{ getNameDirectMessage(chatname) }}
                </div>
                <div ref="chatArea" class="chat-area">
                  <div
                    v-for="message in messages"
                    v-bind:key="message.message"
                    class="message"
                    :class="{
                      'message-out': message.username === user?.username,
                      'message-in': message.username !== user?.username,
                    }"
                  >
                    <b-col
                      ><p
                        v-if="message.username === user?.username"
                        class="message-text"
                      >
                        <a>{{ message.message }}</a>
                      </p></b-col
                    >
                    <b-col
                      ><p
                        v-if="message.username !== user?.username"
                        class="message-text"
                      >
                        <a v-on:click="searchFriend(message.username)">{{
                          message.username + ": "
                        }}</a
                        ><a>{{ message.message }}</a>
                      </p></b-col
                    >
                  </div>
                </div>
                <div class="form-outline form-white chat-footer">
                  <input
                    type="username"
                    id="typeusernameX"
                    v-on:keyup.enter="sendMessage()"
                    v-model="message"
                    class="chat-input"
                  />
                  <b-button class="chat-button" v-on:click="sendMessage()">Send message</b-button>
                  <b-button v-if="role === 'owner' ||  role === 'admin'" class="chat-button" @click="modalChatAdmin = !modalChatAdmin"   style="margin-left: 10px">Manage chat</b-button>
                </div>
              </div>
            </div>

            <div class="form-outline form-white mb-4">
              <input
                type="username"
                id="typeusernameX"
                class="form-control form-control-lg"
                v-model="searchedChat"
                placeholder="Chat name"
              />
              <input
                type="password"
                id="typePasswordX"
                class="form-control form-control-lg"
                placeholder="Password"
                v-model="searchedChatPassword"
                :disabled="!searchedChatRequiresPassword"
              />

              <b-button @click="searchChat(searchedChat)">Search chat</b-button>
              <input
                type="checkbox"
                v-model="searchedChatRequiresPassword"
                v-on:click="searchedChatPassword = ''"
              />
            </div>
            <b-button @click="modalShow = !modalShow">Create Chat</b-button>

          </div>
        </main>
      </div>
    </div>
    <div>
      <b-modal
        id="modal-center"
        centered="true"
        v-model="modalShow"
        @ok="handleSubmitCreateChat()"
      >
        <div class="mb-md-5 pb-9">
          <h2 class="fw-bold mb-5 text-uppercase">Create chat</h2>

          <div class="form-outline form-white mb-2">
            <input
              type="chatname"
              id="typeChatname"
              class="form-control form-control-lg"
              placeholder="Type chat name"
              v-model="createdChatName"
            />
            <label class="form-label" for="typeUsername">Chat name</label>
          </div>
          <div class="form-outline form-white mb-2">
            <input
              type="password"
              id="typePasswordX"
              class="form-control form-control-lg"
              placeholder="Type your new password"
              v-model="createdChatPassword"
              :disabled="!createdChatRequiresPassword"
            />
            <label class="form-label" for="typeEmailX">Password needed? </label>
            <input type="checkbox" v-model="createdChatRequiresPassword" />
          </div>

          <div class="form-outline form-white mb-2">
            <input
              type="participants"
              id="typeParticipantsdX"
              class="form-control form-control-lg"
              placeholder="Participant name"
              v-model="createdChatAddParticipant"
            />
            <b-button
              class="mt-1 pb-9"
              @click="createdChatParticipants.push(createdChatAddParticipant)"
              >Add participant</b-button
            >
          </div>
          <label class="form-label" for="typePasswordX">Participants:</label>
          <div v-for="item in createdChatParticipants" v-bind:key="item">
            <a style="text-align: right">
              {{ item }}
            </a>
          </div>
          <div class="form-outline form-white"></div>
        </div>
      </b-modal>
    </div>


    <div>
      <b-modal
        id="modal-center"
        centered="true"
        v-model="modalChatAdmin"
        @ok="handleSubmitCreateChat()"
      >
        <div class=" pb-9">
          <h2 class="fw-bold text-uppercase">{{ 'Manage chat ' + chatname}}</h2>

          <div class="form-outline form-white mb-2">
            <input
              type="chatname"
              id="typeChatname"
              class="form-control form-control-lg"
              placeholder="Type chat name"
              v-model="createdChatName"
            />
            <label class="form-label" for="typeUsername">Chat name</label>
          </div>
          <div class="form-outline form-white mb-2">
            <input
              type="password"
              id="typePasswordX"
              class="form-control form-control-lg"
              placeholder="Type your new password"
              v-model="createdChatPassword"
              :disabled="!createdChatRequiresPassword"
            />
            <label class="form-label" for="typeEmailX">Password needed? </label>
            <input type="checkbox" v-model="createdChatRequiresPassword" />
          </div>

          <div class="form-outline form-white mb-2">
            <input
              type="participants"
              id="typeParticipantsdX"
              class="form-control form-control-lg"
              placeholder="Participant name"
              v-model="createdChatAddParticipant"
            />
            <b-button
              class="mt-1 pb-9"
              @click="createdChatParticipants.push(createdChatAddParticipant)"
              >Add participant
              </b-button>
          </div>
          <label class="form-label" for="typePasswordX">Participants:</label>
          <div v-for="item in createdChatParticipants" v-bind:key="item">
            <a style="text-align: right">
              {{ item }}
            </a>
          </div>
          <div class="form-outline form-white"></div>
        </div>
      </b-modal>
    </div>
  </section>
</template>
  
  <script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore, mapActions } from "vuex";
import { key, store } from "../..//store/store";
import "@/style/styles.css";
import { useSocketIO } from "../..//main";
import { getChatById, IMessage, newChat, updateChat } from "../..//api/chat";
import { getChat } from "../..//api/chatname";
import { updateUserChats } from "../../api/user";
import { getUser } from "../../api/username";
import axios from "axios";

declare var require: any;

const InputUI = {
  template: "#input-ui",
  data() {
    return {
      value: "",
    };
  },
};

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
    if (this.$route.query.name !== undefined) {
      this.chatname = this.$route.query.name as string;
    } else {
      this.chatname = "general";
      this.role = "user";
    }
    try {
      this.searchChat(this.chatname);
    } catch {
      this.chatname = "general";
      this.role = "user";
      this.searchChat(this.chatname);
    }
    this.io.socket.offAny();
    this.io.socket.on("new_message", (message, username) => {
      if (this.user?.username !== username) {
        console.log("Nuevo mensaje!!");
        this.messages.push({ message: message, username: username });
      }
    });
  },

  beforeRouteLeave() {
    this.io.socket.offAny();
  },

  data() {
    let searchedChat = "";
    let chatname = "general";
    let message = "";
    let messages: IMessage[] = [{ message: "hola", username: "holi" }];
    let chatsFromUser = [{ name: "" }];
    var createdChatParticipants: string[] = ["holi"];
    const user = store.state.user;
    //let chatArea = this.$refs.chatArea as any
    //console.log(chatArea.scrollTop)
    //chatArea.scrollTop = chatArea.scrollHeight
    messages.pop();
    chatsFromUser.pop();
    createdChatParticipants.pop();

    axios({
      method: "get",
      url: "http://localhost:3000/users/" + user?.id,
      data: {},
    }).then((response) => {
      for (var i in response.data.chats) {
        chatsFromUser.push(response.data.chats[i]);
      }
    });

    getChat(chatname).then((response) => {
      this.chatUUID = response.data;
      axios({
        method: "get",
        url: "http://localhost:3000/chats/" + response.data,
        data: {},
      }).then((response) => {
        for (var i in response.data.messages) {
          messages.push(response.data.messages[i]);
        }
        //this.$forceUpdate();
      });
    });

    const io = useSocketIO();

    return {
      message,
      io,
      chatname,
      role: "",
      searchedChat,
      messages,
      chatsFromUser,
      modalShow: false,
      createdChatName: "",
      createdChatPassword: "",
      createdChatRequiresPassword: false,
      createdChatAddParticipant: "",
      createdChatParticipants,
      searchedChatPassword: "",
      searchedChatRequiresPassword: false,
      modalChatAdmin: false
      //chatArea
    };
  },

  methods: {
    getNameDirectMessage(name: string) {
      if (name.split("¿")[0] === "directMessage") {
        return name.split("¿")[1].includes(this.user?.username as string)
          ? name.split("¿")[2]
          : name.split("¿")[1];
      }
      return name;
    },

    sendMessage() {
      if (this.message !== "") {
        if (!this.user) {
          console.error("user not defined, esto no deberia pasar");
          return;
        }
        this.io.socket.emit("event_message", {
          room: this.chatname,
          message: this.message,
          username: this.user.username,
        });
        this.messages.push({
          message: this.message,
          username: this.user.username,
        });
        updateChat(this.chatUUID, {
          chatname: this.chatname,
          password: "",
          messages: this.messages,
        }).catch((err) => {
          alert("Error sending the message. Try again later");
        });
        this.message = "";
        //this.chatArea.scrollTop = this.chatArea.scrollHeight
      }
    },

    searchChat(searchedChat: string) {
      axios({
        method: "get",
        url: "http://localhost:3000/chatname/" + searchedChat,
        data: {},
      })
        .then((response) => {
          //validar
          this.chatUUID = response.data;
          axios({
            method: "get",
            url: "http://localhost:3000/chats/" + response.data,
            data: {},
          }).then((response) => {
            var validated = false;
            if (
              this.chatsFromUser.find(
                (element) => element.name === searchedChat
              ) !== undefined
            ) {
              validated = true;
            } else {
              if (response.data.password !== "") {
                if (this.searchedChatPassword === response.data.password) {
                  validated = true;
                } else {
                  alert("Wrong password!!");
                }
              } else {
                validated = true;
              }
            }
            if (validated) {
              
              this.changeChat(this.chatUUID, searchedChat);
              if (
                this.chatsFromUser.find((str) => str.name === searchedChat) ===
                undefined
              ) {
                axios({
                  method: "put",
                  url: "http://localhost:3000/addChat/" + this.user?.id,
                  data: { name: searchedChat },
                });
                this.chatsFromUser.push({ name: searchedChat });
              }
              //this.role = this.chatsFromUser.find((str) => str.name === searchedChat)
              for (var i in response.data.messages) {
                this.messages.push(response.data.messages[i]);
              }
            }
          });
        })
        .catch(() => alert("No chats found with that name"));
    },

    changeChat(chatUUID: string, chatname: string) {
      if (!this.user) return;
      this.chatUUID = chatUUID;
      this.io.socket.emit("event_leave", this.chatname);
      this.messages = [];
      this.io.socket.emit("event_join", chatname);
      this.chatname = chatname;
    },
    addUsersToChat(users: string[], chatName: string) {
      for (var l in users) {
        getUser(users[l])
          .then((response) => {
            axios({
              method: "put",
              url: "http://localhost:3000/addChat/" + response.data.id,
              data: { name: chatName, role: "user" },
            });
          })
          .catch((error) =>
            console.log("tryed to add a user that doesn't exist to a new chat")
          );
      }
      axios({
        method: "put",
        url: "http://localhost:3000/addChat/" + this.user?.id,
        data: { name: chatName, role: "owner" },
      });
    },

    async createChat(chatName: string, password: string, users: string[]) {
      axios({
        method: "post",
        url: "http://localhost:3000/chats",
        data: {
          chatname: chatName,
          password: password,
          messages: "",
        },
      })
        .then((response) => {
          this.chatsFromUser.push({ name: chatName });
          this.addUsersToChat(users, chatName);
        })
        .catch((err) => {
          alert("Name already in use");
        });
    },

    async handleSubmitCreateChat() {
      if (this.createdChatName === "") {
        alert("Chat name cannot be empty");
      } else {
        await this.createChat(
          this.createdChatName,
          this.createdChatPassword,
          this.createdChatParticipants
        ).then(() => {
          this.createdChatName = "";
          this.createdChatPassword = "";
          this.createdChatRequiresPassword = false;
          this.createdChatAddParticipant = "";
          this.createdChatParticipants = [];
        });
      }
    },

    searchFriend(username: string) {
      //todo: update para usar apis
      getUser(username)
        .then((response) => {
          this.$router.push("/user?uuid=" + response.data.id);
        })
        .catch((error) => {
          alert("usuario o contraseña incorrectos");
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
  height: 100vh;
  background: #3609da;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(
    to right,
    rgba(4, 8, 22, 0.804),
    rgb(252, 253, 254)
  );

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(
    to right,
    rgba(4, 8, 22, 0.804),
    rgb(249, 251, 255)
  );
}



.chat-button{
  background: #3466cb;
  color: #dfdfdf;

}
.chat-input{
  width: 73%;
  height: 3vh;
  background: #d1d1d1;
}
.chat-header {
  height: 2vh;
  color:#f4f4f4

}

.chats-window {
  width: 100%;
  background: #5b5b5b;
  box-shadow: 2px 2px 5px 2px rgba(0, 0, 0, 0.3);
  margin-bottom: 5vh;

  height: 61vh;
  border-radius: 10px;
}
.chats-list {
  background: #5b5b5b;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  border-radius: 10px;
}
.chat-area {
  /*   border: 1px solid #ccc; */
  background: #343434;
  height: 55vh;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
.message {
  max-width: 45%;
  border-radius: 10px;
  padding: 0.2em;
  margin-bottom: 0.1em;
  font-size: 0.9em;
  text-overflow: ellipsis;
}
.message-out {
  background: #407fff;
  color: white;
  margin-left: 55%;
  margin-top: 0.7em;
  text-align: right;
  max-width: 45%;
}
.message-in {
  background: #62c530;
  color: black;
  text-align: left;
  margin-top: 0.7em;
  margin-left: 4px;
  max-width: 45%;
}

.background {
  background: #787878;
  height: 100vh;
}

.message-text {
  overflow-wrap: break-word;
  margin-right: 8px;
  margin-left: 8px
}
</style>