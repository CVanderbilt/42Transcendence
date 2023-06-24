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
                <b-button v-on:click='changeRoom(generalRoom.id, generalRoom.name)'
                  style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0; margin-top: 30px;">
                  chat general
                </b-button>

                <h6 style="color: white; margin-top: 30px;">Group chats</h6>
                <div v-for="item in userMemberships" v-bind:key="item.chatRoom.name">
                  <div v-if="!item.chatRoom.isDirect && item.chatRoom.id != '1'" style="display: flex;">
                    <b-button v-on:click="changeRoom(item.chatRoom.id, item.chatRoom.name)"
                      style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                      {{ item.chatRoom.name }}
                    </b-button>
                    <button v-if="item.chatRoom.name !== generalRoom.name" @click="leaveRoom(item.chatRoom.id)"> x </button>
                  </div>
                </div>

                <b-button @click="modalShow = !modalShow" style="margin: 10px;">Create Chat Room</b-button>

                <!-- direct chats -->
                <h6 style="color: white; margin-top: 30px;">Direct chats</h6>
                <div v-for="item in niceRoomNames" v-bind:key="item.niceName">
                  <div v-if="item.chatRoom.isDirect" style="display: flex;">
                    <b-button v-on:click="changeRoom(item.chatRoom.id, item.chatRoom.name)"
                      style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                      {{ item.niceName }}
                    </b-button>
                    <button @click="leaveRoom(item.chatRoom.id)"> x </button>
                  </div>
                </div>
              </div>

              <div class="col-9 chat-column" style="margin-bottom: 20px;">
                <div class="chat-header">
                  {{ niceRoomNames.find((room) => room.chatRoom.id == currentMembership.chatRoom.id)?.niceName }}
                </div>

                <!-- ------------------ chat area ------------------ -->
                <div v-if="dateOK(currentMembership.bannedUntil)">
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
                          <div v-if="message.senderName !== user?.username" class="message-text">
                            <a v-if="message.isGame" style="cursor: pointer;">{{
                              message.senderName + ": " + "GAME!" }}
                            </a>
                            <a v-else style="cursor: pointer;" v-on:click="showUserActions(message.senderId as string)">{{
                              message.senderName + ": " + message.content }}
                            </a>
                          </div>
                        </b-col>
                      </div>
                    </div>
                  </div>
                  <div v-if="dateOK(currentMembership.mutedUntil)" class="form-outline form-white chat-footer">
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
                    <p>You are muted until {{ getNiceDate(currentMembership.mutedUntil) }}</p>
                  </div>
                </div>
                <div v-else>
                  <h3>You are banned until</h3>
                  <h3>{{ getNiceDate(currentMembership.bannedUntil) }}</h3>
                </div>

              </div>
            </div>

            <!-- ------------------ search chat ------------------ -->
            <div class="form-outline form-white mb-4">
              <input type="username" id="typeusernameX" class="form-control form-control-lg" v-model="searchedChat"
                placeholder="Chat name" />
              <input type="password" class="typePasswordX form-control form-control-lg" placeholder="Password"
                v-model="searchedChatPassword" />

              <b-button @click="joinRoomBySearchBar(searchedChat, searchedChatPassword); searchedChatPassword = '';">Join
                room</b-button> <!-- TODO: cambiar por joinRoomWithId -->
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
          <h2 class="fw-bold text-uppercase">Manage chat</h2>

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

    <!-- user info -->
    <div>
      <b-modal id="modal-center" centered="true" v-model="modalUserActions.show">
        <div class=" pb-9">
          <div style="display: flex; gap: 20px;">
            <h2 style="cursor: pointer;" v-on:click="searchFriend()" class="fw-bold text-uppercase">{{
              modalUserActions.userName }}</h2>
            <b-button style="background-color: rgb(0, 106, 255);" type="button" @click="WatchUserGame(modalUserActions.userId)">Watch</b-button>
            <b-button style="background-color: rgb(0, 0, 0);" type="button" @click="challengePlayer(modalUserActions.userId)">Duel</b-button>
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
import { IUser, key, store } from "../../store/store";
import "@/style/styles.css";
import { app, useSocketIO } from "../../main";
import { postChatMessageReq, getChatRoomMessagesReq, Membership, getUserMembershipsReq, leaveChatRoomReq, getChatRoomMembershipsReq, updateChatRoomMembershipsReq, createChatRoomReq, deleteChatRoomMembershipsReq, updateChatRoomPasswordReq, ChatRoom, getChatRoomByIdReq, getGeneralRoom } from "../../api/chatApi";
import { getChatRoomByNameReq, joinChatRoomReq, inviteUsersReq as inviteUserReq, } from "../../api/chatApi";
import { ChatMessage } from "../../api/chatApi";
import { getUserById, getUserByName } from "../../api/user";
import { getFriendshipsRequest } from "../../api/friendshipsApi";
import { IFriendship } from "../../api/friendshipsApi";
import moment from 'moment';
import 'moment-timezone';
import { throwFromAsync } from "@/utils/utils";
import { challenge, getCurrentMatch } from "@/api/gameApi";

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

    var generalRoom : ChatRoom = {
      id: "",
      name: "",
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
      niceRoomNames: [] as { chatRoom: ChatRoom, niceName: string }[],
      modalUserActions: {
        show: false,
        userId: "",
        userName: "",
        matchUrl: "",
        currentGameId: "",
      },
      generalRoom,
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
    if (this.$route.query.challenge) {
      console.log("challenge in query")
      this.challengePlayer(this.$route.query.challenge as string)
    }

    this.generalRoom = await (await getGeneralRoom()).data

    this.chatRoomName = this.generalRoom.name;
    this.chatRoomId = this.generalRoom.id
    this.isAdmin = false;

    this.joinRoomWithId(this.generalRoom.id);

    const requestedRoomId = this.$route.query.roomId as string;
    if (requestedRoomId) {
      const chatRoom = await (await getChatRoomByIdReq(requestedRoomId)).data
      this.chatRoomId = requestedRoomId
      this.chatRoomName = chatRoom.name
      console.log("url id " + this.chatRoomName)
      // join room
      this.joinRoomWithId(this.chatRoomId)
      this.roomId = this.chatRoomId
    }

    // get all user memberships
    this.userMemberships = (await (await getUserMembershipsReq(this.user?.id as string)).data)

    // get current membership
    const membership = this.userMemberships.find((membership: any) => membership.chatRoom.name === this.chatRoomName)
    if (membership !== undefined)
      this.currentMembership = membership

    // get friendships
    this.userFriendships = await getFriendshipsRequest(this.user?.id as string)

    // join message socket
    this.io.socket.offAny();
    this.io.socket.on("new_message", (message, userName, senderId, roomId, isGame) => {
      const msg: ChatMessage = {
        content: message,
        senderName: userName,
        senderId: senderId,
        chatRoomId: roomId,
        isGame: isGame,
      }

      this.messages.push(msg)
    });

    this.fetchNiceRoomNames()
  },

  beforeRouteLeave() {
    this.io.socket.offAny();
  },

  methods: {
    async fetchNiceRoomNames() {
      let chatRooms: ChatRoom[] =
        this.userMemberships.map((membership) => membership.chatRoom)

      chatRooms.forEach(async room => {
        let name = room.name
        if (room.isDirect) {
          const memberships = await (await (getChatRoomMembershipsReq(room.id))).data as Membership[]
          name = memberships[0].user.username + "-" + memberships[1].user.username
        }

        this.niceRoomNames.push({
          chatRoom: room,
          niceName: name,
        })
      })

      // remove duplicates
      this.niceRoomNames = this.niceRoomNames.filter((value, index) => this.niceRoomNames.indexOf(value) === index)
    },

    getNiceDate(date: string) {
      return moment(date).format('MMMM Do YYYY, h:mm:ss a')
    },

    isDisplayMessage(senderId: string): boolean {
      const membership = this.userFriendships.find(x => x.friend.id === senderId)
      if (membership)
        return !membership.isBlocked
      return true
    },

    async sendMessage() {
      // get all user memberships
      try {
        this.userMemberships = (await (await getUserMembershipsReq(this.user?.id as string)).data)
      } catch {
        throwFromAsync(app, "Error retrieving memberships")
        return
      }

      // update current membership
      const membership = this.userMemberships.find((membership: any) => membership.chatRoom.name === this.chatRoomName)
      if (membership !== undefined) {
        this.currentMembership = membership
      }
      else {
        throwFromAsync(app, "Not a member")
        this.changeRoom(this.generalRoom.id , this.generalRoom.name)
        return;
      }

      if (!this.dateOK(this.currentMembership.mutedUntil)  || !this.dateOK(this.currentMembership.bannedUntil) ) {
        alert("You can not send messages here")
        return;
      }

      if (this.message !== "") {
        if (!this.user) {
          console.error("user not defined, esto no deberia pasar");
          return;
        }

        // send through socket
        const msg2emit = {
          roomId: this.roomId,
          userName: this.user.username,
          message: this.message,
          token: localStorage.getItem("token"),
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
      }
    },

    async joinRoomWithId(roomId: string, password?: string) {
      if (roomId === "") {
        return
      }

      let room = (await getChatRoomByIdReq(roomId)).data
      if (!room) {
        alert("Room not found")
        room = this.generalRoom
      }

      try {
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
      try {
        this.changeRoom(room.id, room.name); //TODO: esta excepcion no se captura ( cuando intentas meterte en un chat directo de otros)
      }
      catch (error: any) {
        const errorMsg = (error).response?.data?.message
        alert("Error changing the room: " + (errorMsg || "Unknown error"));
        return;
      }
    },

    async joinRoomBySearchBar(roomName2join: string, password?: string) {
      if (roomName2join === "") {
        return;
      }

      let room = (await getChatRoomByNameReq(roomName2join)).data
      if (!room) {
        alert("Room not found")
        room = this.generalRoom
      }

      try {
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

      try {
        this.changeRoom(room.id, room.name);//TODO: esta excepcion no se captura ( cuando intentas meterte en un chat directo de otros)
      }
      catch (error: any) {
        throwFromAsync (app, "Error changing the room: " + (error.response?.data?.message || "Unknown error"))
      }
      // change chat
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
      this.changeRoom(this.generalRoom.id, this.generalRoom.name)
    },

    async changeRoom(roomId: string, roomName: string) {
      const currentRoomId = this.roomId
      getUserMembershipsReq(this.user?.id as string).then((response) => {
        this.userMemberships = response.data
        const membership = this.userMemberships.find((membership) => membership.chatRoom.id == roomId)
        if (!membership) {
          throwFromAsync(app, "You are not a member of this room")
          return
        }

        if (!this.dateOK(membership.bannedUntil)) {
          throwFromAsync(app, "You are banned from room " + membership.chatRoom.name)
          return;
        }

        this.currentMembership = membership
        this.roomId = roomId;
        this.io.socket.emit("event_leave", currentRoomId);
        this.messages = [];
        const payload = {
          roomName: roomName,
          roomId: roomId,
          userId: this.user?.id,
          token: localStorage.getItem('token'),
        }

        this.io.socket.emit("event_join", payload);
        this.chatRoomName = roomName;

        getChatRoomMessagesReq(roomId).then((response) => {
          for (var i in response.data) {
            this.messages.push(response.data[i]);
          }
        }).catch((error) => {
          throwFromAsync(app, "Error getting messages: " + error.response?.data?.message || "Unknown error")
        });
      })
    },

    async createChatRoom(roomName: string, password: string, userNames: string[]) {
      let room: any
      try {
        room = await (await createChatRoomReq(roomName, this.user?.id as string, password)).data
      }
      catch (err: any) {
        throwFromAsync(app, JSON.stringify(err)) // TODO: revisar el throwFromAsync, cuando se intenta crear una sala con un nombre que ya está pillado
        // publishNotification("Error creating chat room: " + err , true)
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
        throwFromAsync(app, "Error joining chat room: " + err)
      }

      if (room) {
        // invite users
        userNames.forEach(async (username) => {
          try {
            if (username !== this.user?.username && username !== "") {
              const invitee = await getUserByName(username)
              inviteUserReq(room.id, invitee.data.id)
            }
          }
          catch (err: any) {
            throwFromAsync(app, "Could not invite user")
          }
        })

        const niceRoomName = { chatRoom: room as ChatRoom, niceName: room.name }
        this.niceRoomNames.push( niceRoomName )
        this.changeRoom(room.id, room.name)
      }
    },

    async removeChatMembership(membershipId: string) {
      try {
        await deleteChatRoomMembershipsReq(membershipId)
        this.managedChatMemberships = this.managedChatMemberships.filter((membership) => membership.id !== membershipId)
      } catch (error) {
        alert("Can not remove user from chat room: " + error);
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
          membership.bannedUntil = this.time2local(membership.bannedUntil)
          membership.mutedUntil = this.time2local(membership.mutedUntil)
        })
        const room = (await getChatRoomByNameReq(this.chatRoomName)).data
        if (room) {
          this.managedChatRequiresPassword = room.isPrivate
        }
      }
      catch (err) {
        throwFromAsync(app, "Error getting chat room memberships: " + err)
      }
    },

    time2local(time: string) {
      let date, localDate, localDateTimeString
      date = moment(time).tz('UTC');
      localDate = date.clone().tz(moment.tz.guess())
      localDateTimeString = localDate.format('YYYY-MM-DDTHH:mm');
      return localDateTimeString
    },

    time2utc(time: string) {
      let localDate, utcDate, utcDateTimeString
      localDate = moment(time);
      utcDate = localDate.clone().tz('UTC')
      utcDateTimeString = utcDate.format('YYYY-MM-DDTHH:mm:ss')
      return utcDateTimeString
    },

    async handleManageChat() {
      // update password      
      if (this.managedChatPassword !== "") {
        await updateChatRoomPasswordReq(this.roomId, this.managedChatPassword)
      }

      // update current chat members
      this.managedChatMemberships.forEach(async (membership) => {
        membership.bannedUntil = this.time2utc(membership.bannedUntil)
        membership.mutedUntil = this.time2utc(membership.mutedUntil)
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
        alert("Can not invite users to chat room: " + error);
      }
    },

    async showUserActions(clickedUserId: string) {
      this.modalUserActions.userId = clickedUserId;
      const clickedUser = await (await getUserById(clickedUserId)).data as IUser
      this.modalUserActions.userName = clickedUser.username;

      this.modalUserActions.show = !this.modalUserActions.show;
    },

    searchFriend() {
      this.$router.push("/user?uuid=" + this.modalUserActions.userId);
    },

    WatchUserGame(player?: string) {
      if (!player) return

      getCurrentMatch(player)
      .then(response => {
        alert(JSON.stringify(response, null, 2))
        this.$router.push("/game?id=" + response.data);
      })
    },
    async challengePlayer(opponent?: string) {
      if (!opponent) return
      challenge(store.state.user.id, opponent)
      .then(response => {
        //todo: logica de mandar un mensaje con el link a la partida al jugador al que retamos
        this.$router.push("/game?id=" + response.data);
      })
    },

    dateOK(date: string) {
      if (date === "") 
        return true

      // check if date is in the past
      return moment(date).isBefore(moment())
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

.action-button {
 border: 1px solid gray;
 color: black;
 background: rgba(0,0,0,0.5);
}
</style>