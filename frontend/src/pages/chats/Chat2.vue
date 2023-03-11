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
                  <b-button v-on:click="joinRoom(item.name)"
                    style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                    {{ getNameDirectMessage(item.name) }}
                  </b-button>
                </div>
              </div>
              <div class="col-9 chat-column">
                <div class="chat-header">
                  {{ getNameDirectMessage(chatRoomName) }}
                </div>
                <div ref="chatArea" class="chat-area">
                  <div v-for="message in messages" v-bind:key="message.message" class="message" :class="{
                    'message-out': message.username === user?.username,
                    'message-in': message.username !== user?.username,
                  }">
                    <b-col>
                      <p v-if="message.username === user?.username" class="message-text">
                        <a>{{ message.message }}</a>
                      </p>
                    </b-col>
                    <b-col>
                      <p v-if="message.username !== user?.username" class="message-text">
                        <a v-on:click="searchFriend(message.username)">{{
                          message.username + ": "
                        }}</a><a>{{ message.message }}</a>
                      </p>
                    </b-col>
                  </div>
                </div>
                <div class="form-outline form-white chat-footer">
                  <input type="username" id="typeusernameX" v-on:keyup.enter="sendMessage()" v-model="message"
                    class="chat-input" />
                  <b-button class="chat-button" v-on:click="sendMessage()">Send message</b-button>
                  <b-button v-if="isAdmin === 'owner' || isAdmin === 'admin'" class="chat-button"
                    @click="modalChatAdmin = !modalChatAdmin" style="margin-left: 10px">Manage chat</b-button>
                </div>
              </div>
            </div>

            <div class="form-outline form-white mb-4">
              <input type="username" id="typeusernameX" class="form-control form-control-lg" v-model="searchedChat"
                placeholder="Chat name" />
              <input type="password" id="typePasswordX" class="form-control form-control-lg" placeholder="Password"
                v-model="searchedChatPassword" :disabled="!searchedChatRequiresPassword" />

              <b-button @click="joinRoom(searchedChat)">Search chat</b-button>
              <input type="checkbox" v-model="searchedChatRequiresPassword" v-on:click="searchedChatPassword = ''" />
            </div>
            <b-button @click="modalShow = !modalShow">Create Chat</b-button>

          </div>
        </main>
      </div>
    </div>
    <div>
      <b-modal id="modal-center" centered="true" v-model="modalShow" @ok="handleSubmitCreateChat()">
        <div class="mb-md-5 pb-9">
          <h2 class="fw-bold mb-5 text-uppercase">Create chat</h2>

          <div class="form-outline form-white mb-2">
            <input type="chatName" id="typechatName" class="form-control form-control-lg" placeholder="Type chat name"
              v-model="createdchatName" />
            <label class="form-label" for="typeUsername">Chat name</label>
          </div>
          <div class="form-outline form-white mb-2">
            <input type="password" id="typePasswordX" class="form-control form-control-lg"
              placeholder="Type your new password" v-model="createdChatPassword"
              :disabled="!createdChatRequiresPassword" />
            <label class="form-label" for="typeEmailX">Password needed? </label>
            <input type="checkbox" v-model="createdChatRequiresPassword" />
          </div>

          <div class="form-outline form-white mb-2">
            <input type="participants" id="typeParticipantsdX" class="form-control form-control-lg"
              placeholder="Participant name" v-model="createdChatAddParticipant" />
            <b-button class="mt-1 pb-9" @click="createdChatParticipants.push(createdChatAddParticipant)">Add
              participant</b-button>
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
      <b-modal id="modal-center" centered="true" v-model="modalChatAdmin" @ok="handleSubmitCreateChat()">
        <div class=" pb-9">
          <h2 class="fw-bold text-uppercase">{{ 'Manage chat ' + chatRoomName }}</h2>

          <div class="form-outline form-white mb-2">
            <input type="password" id="typePasswordX" class="form-control form-control-lg"
              placeholder="Type your new password" v-model="createdChatPassword"
              :disabled="!createdChatRequiresPassword" />
            <label class="form-label" for="typeEmailX">Password needed? </label>
            <input type="checkbox" v-model="createdChatRequiresPassword" />
          </div>

          <div class="form-outline form-white mb-2">
            <input type="participants" id="typeParticipantsdX" class="form-control form-control-lg"
              placeholder="Participant name" v-model="createdChatAddParticipant" />
            <b-button class="mt-1 pb-9" @click="createdChatParticipants.push(createdChatAddParticipant)">Add participant
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
import { IUser, key, store } from "../../store/store";
import "@/style/styles.css";
import { useSocketIO } from "../../main";
import { postChatMessage, getChatRoomByName, joinChatRoom, inviteUsers, createChatRoom, getChatRoomMessages } from "../../api/chatApi";
import { ChatMessage } from "../../api/chatApi";
import { getUser } from "../../api/username";
import axios from "axios";

declare var require: any;

export default defineComponent({
  name: "Chat2",

  data() {
    let chatMessages: ChatMessage[] = [];
    let userMemberships: any[] = [];
    var createdChatParticipants: string[] = [];
    const user = store.state.user;
    // messages.pop();
    // userMemberships.pop();
    // createdChatParticipants.pop();

    // // get user memeberships
    // if (user !== undefined) {
    //   getUserMemberships(user.id).then((response) => {
    //     for (var i in response.data) {
    //       userMemberships.push(response.data[i]);
    //     }
    //   })
    // }

    // // get chat messages
    // const roomId = getChatRoomByName(chatName).then((response) => {
    //   return response.id as string;
    // })
    // getChatRoomMessages(roomId).then((response) => {
    //   this.chatUUID = response.data;
    //   axios({
    //     method: "get",
    //     url: "http://localhost:3000/chats/" + response.data,
    //     data: {},
    //   }).then((response) => {
    //     for (var i in response.data.messages) {
    //       messages.push(response.data.messages[i]);
    //     }
    //     //this.$forceUpdate();
    //   });
    // });

    const io = useSocketIO();

    return {
      message: "",
      io,
      chatRoomName: "general",
      chatRoomId: "",
      isAdmin: false,
      searchedChat: "",
      messages: chatMessages,
      chatsFromUser: userMemberships,
      modalShow: false,
      createdchatName: "",
      createdChatPassword: "",
      createdChatRequiresPassword: false,
      createdChatAddParticipant: "",
      createdChatParticipants,
      searchedChatPassword: "",
      searchedChatRequiresPassword: false,
      modalChatAdmin: false,
      banned: false,
      muted: false
    };
  },


  setup() {
    const store = useStore(key);
    const user = store.state.user;

    let chatUUID = "";
    return {
      roomId: chatUUID,
      user,
    };
  },

  async mounted() {
    if (this.$route.query.name !== undefined) {
      this.chatRoomName = this.$route.query.name as string;
    } else {
      this.chatRoomName = "general";
      this.isAdmin = false;
    }

    try {
      this.joinRoom(this.chatRoomName);
    } catch {
      this.chatRoomName = "general";
      this.isAdmin = false;
    }

    try {
      const room : any = await getChatRoomByName(this.chatRoomName);
      this.roomId = room.id;
    } catch {
      console.log("Error getting chat room")
    }

    this.io.socket.offAny();
    this.io.socket.on("new_message", (message, username) => {
      if (this.user?.username !== username) {
        console.log("Nuevo mensaje!!")
        const msg : ChatMessage = {
          content: message,
          senderName: username,
          senderId: this.user?.id,
          roomId: this.roomId
        }
        this.messages.push(msg)
      }
    });

  },

  beforeRouteLeave() {
    this.io.socket.offAny();
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
          room: this.chatRoomName,
          message: this.message,
          username: this.user.username,
        })

        const outMessage: ChatMessage = {
          content: this.message,
          roomId: this.roomId,
          senderId: this.user.id,
        }

        this.messages.push(outMessage)

        try {
          postChatMessage(this.roomId, outMessage)
        }
        catch (err: any) {
          alert("Error sending the message. Try again later");
        }

        this.message = "";
        //this.chatArea.scrollTop = this.chatArea.scrollHeight
      }
    },

    async joinRoom(chat2join: string) {
      let room: any;

      // get chat room
      try {
        room = await getChatRoomByName(chat2join).then((response) => {
          return response.data;
        })
      }
      catch (err) {
        console.log("Can not find chat room");
        return;
      }

      // join membership (returns membership if user already a member of the chat room)
      try {
        joinChatRoom(room.id, this.user?.id as string)
      }
      catch (err: any) {
        if (err.stattus === 404)
          console.log("Wrong password");
        else
          console.log("Can not join room");
        return;
      }

      // try to get messages
      try {
        getChatRoomMessages(room.id).then((response) => {
          for (var i in response.data) {
            this.messages.push(response.data[i]);
          }
        })
      }
      catch (err) {
        console.log("Can not get messages");
      }

      // change chat
      this.changeChat(room.id, room.name);
    },

    changeChat(chatUUID: string, chatName: string) {
      if (!this.user) return;
      this.roomId = chatUUID;
      this.io.socket.emit("event_leave", this.chatRoomName);
      this.messages = [];
      this.io.socket.emit("event_join", chatName);
      this.chatRoomName = chatName;
    },

    async addUsersToChat(users: string[], chatName: string) {
      // find room id
      try {
        const room : any = await getChatRoomByName(chatName)
        inviteUsers(room.id, users)
      }
      catch (err) {
        console.log("Can not join users to chat room");
        return;
      }
    },

    async createChatRoom(roomName: string, password: string, users: string[]) {
      try {
        const room : any = await createChatRoom(roomName, this.user?.id as string, password)
        inviteUsers(room.id, users).catch((err) => {
          console.log("Can not invite users to chat room: " + err.message);
        })
      }
      catch (err) {
        console.log("Can not create chat room");
        return;
      }
    },

    async handleSubmitCreateChat() {
      if (this.createdchatName === "") {
        alert("Chat name cannot be empty");
      } else {
        await this.createChatRoom(
          this.createdchatName,
          this.createdChatPassword,
          this.createdChatParticipants
        ).then(() => {
          this.createdchatName = "";
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
  background: -webkit-linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(252, 253, 254));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(249, 251, 255));
}



.chat-button {
  background: #3466cb;
  color: #dfdfdf;

}

.chat-input {
  width: 73%;
  height: 4vh;
  background: #d1d1d1;
}

.chat-header {
  height: 3vh;
  color: #f4f4f4
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
  height: 61vh;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  border-radius: 10px;
}

.chat-area {
  /*   border: 1px solid #ccc; */
  background: #343434;
  height: 54vh;
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