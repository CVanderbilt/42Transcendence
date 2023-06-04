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
                <!-- chat rooms -->
                <h6 style="color: white; margin-top: 30px;">Group chats</h6>
                <div v-for="item in userMemberships" v-bind:key="item.chatRoom.name">
                  <div v-if="!item.chatRoom.isDirect" style="display: flex;">
                    <b-button v-on:click="changeRoom(item.chatRoom.id, item.chatRoom.name)"
                      style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                      {{ item.chatRoom.name }}
                    </b-button>
                    <button v-if="item.chatRoom.name !== 'general'" @click="leaveRoom(item.chatRoom.id)"> x </button>
                  </div>
                </div>

                <b-button @click="modalShow = !modalShow" style="margin: 10px;">Create Room Chat</b-button>

                <!-- direct chats -->
                <h6 style="color: white; margin-top: 30px;">Direct chats</h6>
                <div v-for="item in userMemberships" v-bind:key="item.chatRoom.name">
                  <div v-if="item.chatRoom.isDirect" style="display: flex;">
                    <b-button v-on:click="changeRoom(item.chatRoom.id, item.chatRoom.name)"
                      style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                      {{ getNiceChatName(item.chatRoom) }}
                    </b-button>
                    <button v-if="item.chatRoom.name !== 'general'" @click="leaveRoom(item.chatRoom.id)"> x </button>
                  </div>

                </div>
              </div>

              <div class="col-9 chat-column" style="margin-bottom: 20px;">
                <div class="chat-header">
                  {{ getNiceChatName(currentMembership.chatRoom) }}
                </div>

                <!-- ------------------ chat area ------------------ -->
                <div v-if="!currentMembership.isBanned">
                  <div ref="chatArea" class="chat-area" style="margin-bottom: 20px;">
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

                    <!-- send -->
                    <b-button class="chat-button" v-on:click="sendMessage()">
                      Send message
                    </b-button>
                    <!-- manage -->
                    <b-button v-if="currentMembership.isAdmin === true || currentMembership.isOwner === true"
                      class="chat-button" @click="updateManagedChat()" style="margin-left: 10px">
                      Manage chat
                    </b-button>

                  </div>
                  <div v-else>
                    <p>You are muted</p>
                  </div>
                </div>

              </div>
            </div>

            <!-- ------------------ search chat ------------------ -->
            <div class="form-outline form-white mb-4">
              <input type="username" id="typeusernameX" class="form-control form-control-lg" v-model="searchedChat"
                placeholder="Chat name" />
              <input type="password" class="typePasswordX form-control form-control-lg" placeholder="Password"
                v-model="searchedChatPassword" />

              <b-button @click="joinRoom(searchedChat, searchedChatPassword); searchedChatPassword = '';">Join
                room</b-button>
            </div>


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
            <a style="text-align: right"> {{ item }} </a>
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

          <!-- manage password -->
          <div v-if="currentMembership.isOwner" class="form-outline form-white mb-2">
            <input type="password" class="typePasswordX form-control form-control-lg" placeholder="Type your new password"
              v-model="managedChatPassword" :disabled="!managedChatRequiresPassword" />
            <label class="form-label" for="typeEmailX">Password needed? </label>
            <input type="checkbox" v-model="managedChatRequiresPassword" />
          </div>

          <!-- manage participants -->
          <div id="participants-list">
            <div class="participant-list-item" v-for="item in managedChatMemberships" v-bind:key="item.id">
              <span>
                <h4> {{ item.user.username }}</h4>
              </span>
              <span v-if="item.isOwner">Owner</span>
              <form v-if="!item.isOwner">
                <input type="checkbox" v-model="item.isAdmin" />
                <label for="isAdmin">Admin</label>

                <input type="checkbox" v-model="item.isBanned" />
                <label for="isBanned">Banned</label>
                <div v-if="item.isBanned">
                  <input type="datetime-local" step="60" v-model="item.bannedUntil" />
                  <label for="bannedUntil">Banned until</label>
                </div>

                <input type="checkbox" v-model="item.isMuted" />
                <label for="isMutted">Mutted</label>
                <div v-if="item.isMuted">
                  <input type="datetime-local" step="60" v-model="item.mutedUntil" />
                  <label for="mutedUntil">Muted until</label>
                </div>

                <b-button style="background-color: brown;" type="button"
                  @click="removeChatMembership(item.id)">Kick</b-button>
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
import { postChatMessageReq, getChatRoomMessagesReq, Membership, getUserMembershipsReq, leaveChatRoomReq, getChatRoomMembershipsReq, updateChatRoomMembershipsReq, createChatRoomReq, deleteChatRoomMembershipsReq, updateChatRoomPasswordReq, ChatRoom } from "../../api/chatApi";
import { getChatRoomByNameReq, joinChatRoomReq, inviteUsersReq as inviteUserReq, } from "../../api/chatApi";
import { ChatMessage } from "../../api/chatApi";
import { getUserByName } from "../../api/user";
import { getFriendshipsRequest } from "../../api/friendshipsApi";
import { IFriendship } from "../../api/friendshipsApi";
import moment from 'moment';
import 'moment-timezone';

export default defineComponent({
  name: "Chat2",

  data() {
    let chatMessages: ChatMessage[] = []
    let userMemberships: Membership[] = []
    var createdChatParticipants: string[] = []
    let userFriendships: IFriendship[] = []
    var managedChatMemberships: Membership[] = []
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
      manageChatParticipants: manageChatParticipants,
      currentMembership,
      managedChatPassword: "",
      managedChatRequiresPassword: false,
      managedBannedMinutes: 0,
      managedMutedMinutes: 0,
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
    this.chatRoomName = "general"; // default room
    this.isAdmin = false;

    // get room from query
    if (this.$route.query.name !== undefined) {
      this.chatRoomName = this.$route.query.name as string;
      console.log(this.chatRoomName)
    }

    // join room
    this.joinRoom(this.chatRoomName);

    // get room
    this.roomId = await (await getChatRoomByNameReq(this.chatRoomName)).data.id;
    // get all user memberships
    this.userMemberships = (await (await getUserMembershipsReq(this.user?.id as string)).data)

    // get current membership
    const membership = this.userMemberships.find((membership: any) => membership.chatRoom.name === this.chatRoomName)
    if (membership !== undefined) {
      this.currentMembership = membership
    }

    // get friendships
    this.userFriendships = await getFriendshipsRequest(this.user?.id as string)

    // join message socket
    this.io.socket.offAny();
    this.io.socket.on("new_message", (message, username,) => {
      const msg: ChatMessage = {
        content: message,
        senderName: username,
        senderId: "",
        chatRoomId: ""
      }
      this.messages.push(msg)
    });

  },

  beforeRouteLeave() {
    this.io.socket.offAny();
  },

  methods: {
    getNiceChatName(chatRoom: ChatRoom) {
      const name = chatRoom.name;
      if (chatRoom.isDirect) {
        if (name.split("¿")[0] === "directMessage") {
          return name.split("¿")[1].includes(this.user?.username as string)
            ? name.split("¿")[2]
            : name.split("¿")[1];
        }
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

    async sendMessage() {
      // get all user memberships
      try {
        this.userMemberships = (await (await getUserMembershipsReq(this.user?.id as string)).data)
      } catch {
        console.log("Error getting user memberships")
      }
      // update current membership
      const membership = this.userMemberships.find((membership: any) => membership.chatRoom.name === this.chatRoomName)
      if (membership !== undefined) {
        this.currentMembership = membership
      }
      else {
        console.error("membership not found");
        return;
      }

      if (this.currentMembership.isMuted || this.currentMembership.isBanned) {
        return;
      }

      if (this.message !== "") {
        if (!this.user) {
          console.error("user not defined, esto no deberia pasar");
          return;
        }

        // send through socket
        const msg2emit = {
          room: this.chatRoomName,
          message: this.message,
          username: this.user.username,
          roomId: this.roomId,
        }

        this.io.socket.emit("event_message", msg2emit)

        // send through api
        const outMessage: ChatMessage = {
          content: this.message,
          chatRoomId: this.roomId,
          senderId: this.user.id,
        }

        postChatMessageReq(this.roomId, outMessage)

        this.message = "";
        // this.chatArea.scrollTop = this.chatArea.scrollHeight
      }
    },

    async joinRoom(room2join: string, password?: string) {
      if (room2join === "") {
        console.log("Empty room name");
        return;
      }

      let room = (await getChatRoomByNameReq(room2join)).data
      if (!room) {
        alert("Room not found")
        room = (await getChatRoomByNameReq("general")).data
      }

      try {
        console.log("joining room")
        const resp = await joinChatRoomReq(room.id, this.user?.id as string, password) // returns membership even if user is already a member of the room
        this.isAdmin = resp.data.isAdmin
        if (!this.userMemberships.find((membership) => membership.chatRoom.id === room.id)) {
          this.userMemberships.push(resp.data)
        }
      } catch (error: any) {
        const errorMsg = (error).response?.data?.message
        alert("Error joining the room: " + (errorMsg || "Unknown error"));
        return;
      }
      // change chat
      this.changeRoom(room.id, room.name);
    },

    async leaveRoom(roomId: any) {
      // remove membership
      const membership = this.userMemberships.find((membership) => membership.chatRoom.id === roomId)
      if (membership) {
        this.userMemberships.splice(this.userMemberships.indexOf(membership), 1)
      }
      try {
        await leaveChatRoomReq(roomId, this.user?.id as string)
      } catch (error: any) {
        const errorMsg = (error).response?.data?.message
        alert("Error leaving the room: " + (errorMsg || "Unknown error"));
        // return
      }

      // change to general chat
      const generalChat: any = this.userMemberships.find((membership) => membership.chatRoom.name === "general")
      this.changeRoom(generalChat.chatRoom.id, "general")
    },

    async changeRoom(roomId: string, roomName: string) {
      getUserMembershipsReq(this.user?.id as string)
      .then(response => {
        this.userMemberships = response.data
        const membership = this.userMemberships.find((membership => membership.chatRoom.id === roomId))
        if (!membership) {
          throw new Error("Can not change room")
        }
        this.currentMembership = membership
        this.roomId = roomId;
        this.io.socket.emit("event_leave", this.chatRoomName);
        this.messages = [];
        this.io.socket.emit("event_join", roomName);
        this.chatRoomName = roomName;
        
        getChatRoomMessagesReq(roomId)
        .then(_response => {
          for (var i in _response.data) {
            this.messages.push(response.data[i]);
          }
        })
      })
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
      this.managedChatPassword = ""
      // get chat members
      try {
        this.managedChatMemberships = (await getChatRoomMembershipsReq(this.roomId)).data
        // delete current user from list
        this.managedChatMemberships = this.managedChatMemberships.filter((membership) => membership.user.id !== this.user?.id)
        // transform date to string and remove z at the end so it can be parsed by datepicker
        this.managedChatMemberships.forEach((membership) => {
          if (membership.bannedUntil) {
            const date = moment(membership.bannedUntil).tz('UTC');
            const localDate = date.clone().tz(moment.tz.guess())
            const localDateTimeString = localDate.format('YYYY-MM-DDTHH:mm');
            membership.bannedUntil = localDateTimeString;
          }
          if (membership.mutedUntil) {
            const date = moment(membership.mutedUntil).tz('UTC');
            const localDate = date.clone().tz(moment.tz.guess())
            const localDateTimeString = localDate.format('YYYY-MM-DDTHH:mm');
            membership.mutedUntil = localDateTimeString;
          }
        })
        const room = (await getChatRoomByNameReq(this.chatRoomName)).data
        if (room) {
          this.managedChatRequiresPassword = room.isPrivate
        }
      }
      catch (err) {
        console.log("Can not get chat room memberships");
      }
    },

    async handleManageChat() {
      // update password      
      if (this.managedChatPassword !== "") {
        await updateChatRoomPasswordReq(this.roomId, this.managedChatPassword)
      }

      // update current chat members
      this.managedChatMemberships.forEach(async (membership) => {
        await updateChatRoomMembershipsReq(membership.id, membership)
      })

      // add new members
      try {
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

#modal-center label {
  margin: 0 5px;
}

#modal-center form button {
  margin: 0 15px;
}

#modal-center #participants-list {
  margin-bottom: 30px;
}

.participant-list-item {
  margin: 5px 0;
  border-radius: 5px;
  border: solid 1px #d1d1d1;
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
  /* background: #5b5b5b;
  box-shadow: 2px 2px 5px 2px rgba(0, 0, 0, 0.3); */
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