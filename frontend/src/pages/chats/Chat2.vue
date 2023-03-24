<template>
  <section>
    <div class="background">
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-0" style="color: white">CHAT</h1>

            <div class="row chats-window">
              <!-- ------------------ chats list ------------------ -->
              <div class="col chats-list">
                <div v-for="item in userMemberships" v-bind:key="item.chatRoom.name" style="display: flex;">
                  <b-button v-on:click="joinRoom(item.chatRoom.name as string)"
                    style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                    {{ getNameDirectMessage(item.chatRoom.name as string) }}
                  </b-button>

                  <button v-if="item.chatRoom.name !== 'general'" @click="leaveRoom(item.chatRoom.id)">
                    x
                  </button>

                </div>
              </div>

              <div class="col-9 chat-column">
                <div class="chat-header">
                  {{ getNameDirectMessage(chatRoomName) }}
                </div>

                <!-- ------------------ chat area ------------------ -->
                <div v-if="!currentMembership.isBanned">
                  <div ref="chatArea" class="chat-area">
                    <div v-for="message in messages" v-bind:key="message.content">
                      <div v-if="isDisplayMessage(message.senderId as string)" class="message" :class="{
                        'message-out': message.senderName === user?.username,
                        'message-in': message.senderName !== user?.username,
                      }">
                        <b-col>
                          <p v-if="message.senderName === user?.username" class="message-text">
                            <a>{{ message.content }}</a>
                          </p>
                        </b-col>
                        <b-col>
                          <p v-if="message.senderName !== user?.username" class="message-text">
                            <a v-on:click="searchFriend(message.senderName as string)">{{
                              message.senderName + ": "
                            }}</a><a>{{ message.content }}</a>
                          </p>
                        </b-col>
                      </div>
                    </div>
                  </div>
                  <div v-if="!currentMembership.isMuted" class="form-outline form-white chat-footer">
                    <input type="username" id="typeusernameX" v-on:keyup.enter="sendMessage()" v-model="message"
                      class="chat-input" />
                    <b-button class="chat-button" v-on:click="sendMessage()">Send message</b-button>
                    <b-button v-if="isAdmin === true" class="chat-button" @click="updateManagedChat()"
                      style="margin-left: 10px">Manage chat</b-button>
                  </div>
                  <div v-else>
                    <p>You are muted</p>
                  </div>
                </div>

              </div>
            </div>

            <div class="form-outline form-white mb-4">
              <input type="username" id="typeusernameX" class="form-control form-control-lg" v-model="searchedChat"
                placeholder="Chat name" />
              <input type="password" class="typePasswordX form-control form-control-lg" placeholder="Password"
                v-model="searchedChatPassword" :disabled="!searchedChatRequiresPassword" />

              <b-button @click="searchRoom(searchedChat)">Search chat</b-button>
              <input type="checkbox" v-model="searchedChatRequiresPassword" v-on:click="searchedChatPassword = ''" />
            </div>
            <b-button @click="modalShow = !modalShow">Create Chat</b-button>

          </div>
        </main>
      </div>
    </div>

    <!-- create chat -->
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
            <input type="password" class="typePasswordX form-control form-control-lg" placeholder="Type your new password"
              v-model="createdChatPassword" :disabled="!createdChatRequiresPassword" />
            <label class="form-label" for="typeEmailX">Password needed? </label>
            <input type="checkbox" v-model="createdChatRequiresPassword" />
          </div>

          <div class="form-outline form-white mb-2">
            <input type="participants" id="typeParticipantsdX" class="form-control form-control-lg"
              placeholder="Participant name" v-model="addParticipant" />
            <b-button class="mt-1 pb-9" @click="createdChatParticipants.push(addParticipant)">Add
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

    <!-- manage chat -->  
    <div>
      <b-modal id="modal-center" centered="true" v-model="modalChatAdmin" @ok="handleManageChat()">
        <div class=" pb-9">
          <h2 class="fw-bold text-uppercase">{{ 'Manage chat ' + chatRoomName }}</h2>

          <!-- <div class="form-outline form-white mb-2">
            <input type="password" class="typePasswordX form-control form-control-lg" placeholder="Type your new password"
              v-model="createdChatPassword" :disabled="!createdChatRequiresPassword" />
            <label class="form-label" for="typeEmailX">Password needed? </label>
            <input type="checkbox" v-model="createdChatRequiresPassword" />
          </div> -->

          <!-- manage participants -->
          <div>
            <h2>Current participants:</h2>
            <div v-for="item in managedChatMemberships" v-bind:key="item.id">
              <span>
                {{ item.user.username }}
              </span>
              <span v-if="item.isOwner">Owner</span>
              <form v-if="!item.isOwner">
                <input type="checkbox" v-model="item.isAdmin" />
                <label for="isAdmin">Admin</label>
                <input type="checkbox" v-model="item.isBanned" />
                <label for="isBanned">Banned</label>
                <input type="checkbox" v-model="item.isMuted" />
                <label for="isMutted">Mutted</label>
                <button type="button" @click="removeChatMembership(item.id)">Remove</button>
              </form>
            </div>
          </div>

          <!-- add participants -->
          <div>
            <h2>Invite participants</h2>
            <div class="form-outline form-white mb-2">
              <input type="participants" id="typeParticipantsdX" class="form-control form-control-lg"
                placeholder="Participant name" v-model="addParticipant" />
              <b-button class="mt-1 pb-9" @click="
                manageChatParticipants.push(addParticipant)">Add participant
              </b-button>
            </div>
            <div v-for="item in manageChatParticipants" v-bind:key="item">
              <a style="text-align: right">
                {{ item }}
              </a>
            </div>
          </div>
          <div class="form-outline form-white"></div>
        </div>
      </b-modal>
    </div>
  </section>
</template>
  
<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { key } from "../../store/store";
import "@/style/styles.css";
import { useSocketIO } from "../../main";
import { postChatMessageReq, getChatRoomMessagesReq, Membership, getUserMembershipsReq, leaveChatRoomReq, getChatRoomMembershipsReq, updateChatRoomMembershipsReq, createChatRoomReq, deleteChatRoomMembershipsReq } from "../../api/chatApi";
import { getChatRoomByNameReq, joinChatRoomReq, inviteUsersReq as inviteUserReq, getChatRoomReq, } from "../../api/chatApi";
import { ChatMessage } from "../../api/chatApi";
import { getUserByName } from "@/api/user";
import { getFriendshipsRequest } from "@/api/friendshipsApi";
import { IFriendship } from "@/api/friendshipsApi";

export default defineComponent({
  name: "Chat2",

  data() {
    let chatMessages: ChatMessage[] = []
    let userMemberships: Membership[] = []
    var createdChatParticipants: string[] = []
    let userFriendships: IFriendship[] = []
    var managedChatMemberships: Membership[] = []
    var managedChatMemberships2remove: Membership[] = []
    var manageChatParticipants: string[] = []
    var currentMembership: Membership = {
      id: "",
      chatRoom: {
        id: "",
        name: "",
      },
      user: {
        id: "",
        username: "",
      },
      isOwner: false,
      isAdmin: false,
      isBanned: false,
      isMuted: false,
    }

    const io = useSocketIO();

    return {
      message: "",
      io,
      chatRoomName: "general",
      chatRoomId: "",
      isAdmin: false,
      searchedChat: "",
      messages: chatMessages,
      userMemberships: userMemberships,
      userFriendships: userFriendships,
      modalShow: false,
      createdchatName: "",
      createdChatPassword: "",
      createdChatRequiresPassword: false,
      addParticipant: "",
      createdChatParticipants,
      searchedChatPassword: "",
      searchedChatRequiresPassword: false,
      modalChatAdmin: false,
      banned: false,
      muted: false,
      managedChatMemberships: managedChatMemberships,
      managedChatMemberships2remove : managedChatMemberships2remove,
      manageChatParticipants: manageChatParticipants,
      currentMembership,
    };
  },


  setup() {
    const store = useStore(key);
    const user = store.state.user;

    let roomId = "";
    return {
      roomId: roomId,
      user,
    };
  },

  async mounted() {
    // get room from query
    if (this.$route.query.name !== undefined) {
      this.chatRoomName = this.$route.query.name as string;
    } else {
      this.chatRoomName = "general";
      this.isAdmin = false;
    }
    // join room
    try {
      this.joinRoom(this.chatRoomName);
    } catch {
      this.chatRoomName = "general";
      this.isAdmin = false;
    }
    // get room
    try {
      this.roomId = await (await getChatRoomByNameReq(this.chatRoomName)).data.id;
    } catch {
      console.log("Error getting chat room")
    }
    // get all user memberships
    try {
      this.userMemberships = (await (await getUserMembershipsReq(this.user?.id as string)).data)
    } catch {
      console.log("Error getting user memberships")
    }
    // get current membership
    const membership = this.userMemberships.find((membership: any) => membership.chatRoom.name === this.chatRoomName)
    if (membership !== undefined) {
      this.currentMembership = membership
    }

    this.io.socket.offAny();
    this.io.socket.on("new_message", (message, username) => {
      const msg: ChatMessage = {
        content: message,
        senderName: username,
        senderId: "",
        chatRoomId: ""
      }
      this.messages.push(msg)
    });

    // get friendships
    try {
      this.userFriendships = await getFriendshipsRequest(this.user?.id as string)
    } catch {
      console.log("Error getting user friendships")
    }
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

    isDisplayMessage(senderId: string): boolean {
      const membership = this.userFriendships.find(x => x.friend.id === senderId)
      if (membership) {
        return !membership.isBlocked
      }
      return true
    },

    sendMessage() {
      if (this.message !== "") {
        if (!this.user) {
          console.error("user not defined, esto no deberia pasar");
          return;
        }

        const msg2emit = {
          room: this.chatRoomName,
          message: this.message,
          username: this.user.username,
        }

        this.io.socket.emit("event_message", msg2emit)

        const outMessage: ChatMessage = {
          content: this.message,
          chatRoomId: this.roomId,
          senderId: this.user.id,
        }

        try {
          postChatMessageReq(this.roomId, outMessage)
        }
        catch (err: any) {
          alert("Error sending the message. Try again later");
        }

        this.message = "";
        // this.chatArea.scrollTop = this.chatArea.scrollHeight
      }
    },

    async searchRoom(room2join: string) {
      if (room2join === "") {
        console.log("Empty room name");
        return;
      }

      const room = (await getChatRoomByNameReq(room2join)).data
      if (!room) {
        console.log("Room not found")
        alert("Room not found")
        return
      }

      try {
        const membership = (await joinChatRoomReq(room.id, this.user?.id as string)).data // returns membership even if user is already a member of the room
        membership.chatRoomName = room.name
        membership.chatRoomId = room.id
        membership.userName = this.user?.username as string
        this.userMemberships.push(membership)
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
        getChatRoomMessagesReq(room.id).then((response) => {
          for (var i in response.data) {
            this.messages.push(response.data[i]);
          }
        })
      }
      catch (err) {
        console.log("Can not get messages");
      }

      // change chat
      this.changeRoom(room.id, room.name);
    },

    async joinRoom(room2join: string) {
      if (room2join === "") {
        console.log("Empty room name");
        return;
      }

      const room = (await getChatRoomByNameReq(room2join)).data
      if (!room) {
        console.log("Room not found")
        alert("Room not found")
        return
      }

      try {
        const resp = joinChatRoomReq(room.id, this.user?.id as string) // returns membership even if user is already a member of the room
        this.isAdmin = (await resp).data.isAdmin
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
        getChatRoomMessagesReq(room.id).then((response) => {
          for (var i in response.data) {
            this.messages.push(response.data[i]);
          }
        })
      }
      catch (err) {
        console.log("Can not get messages");
      }

      // change chat
      this.changeRoom(room.id, room.name);
    },

    async leaveRoom(roomId: any) {
      try {
        leaveChatRoomReq(roomId, this.user?.id as string)
        const membership = this.userMemberships.find((membership) => membership.chatRoom.id === roomId)
        if (membership) {
          this.userMemberships.splice(this.userMemberships.indexOf(membership), 1)
        }
        // change to general chat
        const generalChat: any = this.userMemberships.find((membership) => membership.chatRoomName === "general")
        this.changeRoom(generalChat.chatRoomId, "general")
      } catch (err) {
        console.log("Can not leave room");
      }
    },

    changeRoom(roomId: string, roomName: string) {
      const membership = this.userMemberships.find((membership) => membership.chatRoom.id === roomId)
      if (!membership) {
        console.log("Can not change room");
        return;
      }
      this.currentMembership = membership
      this.roomId = roomId;
      this.io.socket.emit("event_leave", this.chatRoomName);
      this.messages = [];
      this.io.socket.emit("event_join", roomName);
      this.chatRoomName = roomName;
    },

    async createChatRoom(roomName: string, password: string, userNames: string[]) {
      let room: any
      try {
        room = await (await createChatRoomReq(roomName, this.user?.id as string, password)).data
      }
      catch (err: any) {
        console.log("Can not create chat room");
        alert("Can not create chat room");
        return;
      }

      try {
        const membership = (await joinChatRoomReq(room.id, this.user?.id as string, password)).data
        membership.chatRoomName = room.name
        membership.chatRoomId = room.id
        membership.userName = membership.user.username
        this.userMemberships.push(membership)
      }

      catch (err) {
        console.log("Can not create chat room");
      }

      if (room) {
        try {
          // get user ids
          userNames.forEach(async (username) => {
            if (username !== this.user?.username && username !== "") {
              const invitee = await getUserByName(username)
              inviteUserReq(room.id, invitee.data.id)
            }
          })
        }
        catch (err: any) {
          console.log("Can not invite users to chat room: " + err.message);
        }

        this.changeRoom(room.id, room.name)
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
          this.addParticipant = "";
          this.createdChatParticipants = [];
        });
      }
    },

    async updateManagedChat() {
      this.modalChatAdmin = !this.modalChatAdmin;

      this.manageChatParticipants = []

      // get chat memberships
      try {
        this.managedChatMemberships = (await getChatRoomMembershipsReq(this.roomId)).data
        // delete current user from list
        this.managedChatMemberships = this.managedChatMemberships.filter((membership) => membership.user.id !== this.user?.id)
      }
      catch (err) {
        console.log("Can not get chat room memberships");
      }
    },

    async handleManageChat() {
      // update current chat members
      this.managedChatMemberships.forEach(async (membership) => {
        await updateChatRoomMembershipsReq(membership.id, membership)
      })

      // add new members
      try { // TODO: capturar error de usuario no encontrado -> el backend devería responder un 404
        this.manageChatParticipants.forEach(async (username) => {
          if (username !== this.user?.username && username !== "") {
            const invitee = (await getUserByName(username)).data
            inviteUserReq(this.roomId, invitee.id)
          }
        })
      } catch (error) {
        console.log("Can not invite users to chat room: " + error);
        alert("Can not invite users to chat room: " + error);
      }
    },

    async removeChatMembership(membershipId: string) {
      alert("Removing user " + membershipId + " from chat room")
      try {
        await deleteChatRoomMembershipsReq(membershipId)
        this.managedChatMemberships = this.managedChatMemberships.filter((membership) => membership.id !== membershipId)
      } catch (error) {
        console.log("Can not remove user from chat room: " + error);
        alert("Can not remove user from chat room: " + error);
      }
    },

    searchFriend(username: string) {
      getUserByName(username)
        .then((response) => {
          this.$router.push("/user?uuid=" + response.data.id);
        })
        .catch((error) => {
          alert("usuario no encontrado");
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