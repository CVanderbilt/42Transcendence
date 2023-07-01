<template>
  <section>
    <div class="background">
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-0" style="color: white; padding-top: 20px;">CHAT</h1>

            <div class="row chats-window">
              <!-- ------------------ chats list ------------------ -->
              <div class="col chats-list">
                <b-button @click="updateInfo(false)" style="margin: 10px;">Update</b-button>
                <!-- chat rooms -->
                <b-button v-on:click='changeRoom(generalRoom.id)'
                  style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0; margin-top: 30px;">
                  chat general
                </b-button>

                <h6 style="color: white; margin-top: 30px;">Group chats</h6>
                <div v-for="item in userMemberships" v-bind:key="item.chatRoom.name">
                  <div v-if="!item.chatRoom.isDirect && item.chatRoom.id != generalRoom.id" style="display: flex;">
                    <b-button v-on:click="changeRoom(item.chatRoom.id)"
                      style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                      {{ item.chatRoom.name }}
                    </b-button>
                    <button v-if="item.chatRoom.name !== generalRoom.name && user.role !== 'ADMIN'"
                      @click="leaveRoom(item.chatRoom.id)"> x
                    </button>
                  </div>
                </div>

                <b-button @click="modalShow = !modalShow" style="margin: 10px;">Create Chat Room</b-button>

                <!-- direct chats -->
                <h6 style="color: white; margin-top: 30px;">Direct chats</h6>
                <div v-for="item in userMemberships" v-bind:key="item.chatRoom.name">
                  <div v-if="item.chatRoom.isDirect" style="display: flex;">
                    <b-button v-on:click="changeRoom(item.chatRoom.id)"
                      style="width: 100%; background-color: #c2c1c1; color:black; border-radius: 0;">
                      {{ item.chatRoom.name }}
                    </b-button>
                    <button v-if="user.role !== 'ADMIN'" @click="leaveRoom(item.chatRoom.id)"> x </button>
                  </div>
                </div>
              </div>

              <div class="col-9 chat-column" style="margin-bottom: 20px;">
                <div class="chat-header">
                  {{ niceRoomNames.find((room) => room.chatRoom.id == currentMembership.chatRoom.id)?.niceName }}
                </div>

                <!-- ------------------ chat area ------------------ -->
                <div v-if="dateOK(currentMembership.bannedUntil)">
                  <div ref="chatArea" class="chat-area" style="margin-bottom: 10px;">
                    <div v-for="message in messages" v-bind:key="message.content">
                      <div v-if="isDisplayMessage(message.senderId as string)" class="message" :class="{
                        'message-out': message.senderName === user?.username,
                        'message-in': message.senderName !== user?.username,
                      }">
                        <b-col>
                          <p v-if="message.senderName === user?.username" class="message-text">
                            <a v-if="message.isChallenge">Challenge sent</a>
                            <a v-else>{{ message.content }}</a>
                          </p>
                        </b-col>
                        <b-col>
                          <div v-if="message.senderName !== user?.username" class="message-text">
                            <router-link v-if="message.isChallenge" :to="'/game?id=' + message.content"
                              style="cursor: pointer; color:black; font-weight: 900;">{{
                                message.senderName + ": " + "DUEL!" }}
                            </router-link>
                            <a v-else style="cursor: pointer;" v-on:click="showUserActions(message.senderId as string)">{{
                              message.senderName + ": " + message.content }}
                            </a>
                          </div>
                        </b-col>
                      </div>
                    </div>
                  </div>
                  <div v-if="dateOK(currentMembership.mutedUntil)" class="form-outline form-white chat-footer">
                    <div>
                      <input type="username" id="typeusernameX" v-on:keyup.enter="sendMessage()" v-model="message"
                        class="chat-input" />
                    </div>
                    <div>
                      <!-- send -->
                      <b-button class="chat-button" v-on:click="sendMessage()">
                        Send message
                      </b-button>
                      <!-- duel -->
                      <b-button v-if="currentMembership.chatRoom.isDirect" style="background-color: rgb(0, 0, 0);"
                        type="button" @click="challengePlayer()">
                        Duel
                      </b-button>
                      <!-- manage -->
                      <b-button
                        v-if="(currentMembership.isAdmin === true || currentMembership.isOwner === true) && !currentMembership.chatRoom.isDirect"
                        class="chat-button" @click="updateManagedChat()" style="margin-left: 10px">
                        Manage chat
                      </b-button>
                    </div>

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
            <div class="form-outline form-white mb-4 find-room-form">
              <input type="username" id="typeusernameX" class="form-control form-control-lg" v-model="searchedChat"
                placeholder="Chat name" />
              <input type="password" class="typePasswordX form-control form-control-lg" placeholder="Password"
                v-model="searchedChatPassword" />

              <b-button @click="joinRoomBySearchBar(searchedChat, searchedChatPassword); searchedChatPassword = '';">Join
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

                <b-button style="background-color: brown;" type="button" @click="kickChatMember(item.id)">Kick</b-button>
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
            <b-button style="cursor: pointer;" v-on:click="searchFriend()" class="fw-bold text-uppercase">Info</b-button>
            <b-button style="background-color: rgb(0, 106, 255);" type="button"
              @click="WatchUserGame(modalUserActions.userId)">Watch</b-button>
            <b-button v-if="!currentMembership.chatRoom.isDirect" style="background-color: rgb(0, 0, 0);" type="button"
              @click="openDirectChat(modalUserActions.userId)">Private chat</b-button>
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
import { postChatMessageReq, getChatRoomMessagesReq, Membership, getUserMembershipsReq, getChatRoomMembershipsReq, updateChatRoomMembershipsReq, createChatRoomReq, deleteChatRoomMembershipsReq, updateChatRoomPasswordReq, ChatRoom, getChatRoomByIdReq, getGeneralRoom, getDirectChatRoomReq } from "../../api/chatApi";
import { getChatRoomByNameReq, joinChatRoomReq, } from "../../api/chatApi";
import { ChatMessage } from "../../api/chatApi";
import { getUserById, getUserByName } from "../../api/user";
import { getFriendshipsRequest } from "../../api/friendshipsApi";
import { IFriendship } from "../../api/friendshipsApi";
import moment from 'moment';
import 'moment-timezone';
import { handleHttpException, throwFromAsync } from "@/utils/utils";
import { challenge, getCurrentMatch } from "@/api/gameApi";
import OpenDirectChatButton from "@/components/OpenDirectChatButton.vue";
import { inviteUsersReq } from "../../api/chatApi";

export default defineComponent({
  name: "Chat2",

  components: {
    OpenDirectChatButton,
  },

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

    var generalRoom: ChatRoom = {
      id: "",
      name: "",
    }

    const io = useSocketIO();

    return {
      // current data
      currentRoomName: "general",
      userMemberships: userMemberships,
      userFriendships: userFriendships,
      currentMembership,
      isAdmin: false,
      // messages
      io,
      message: "",
      messages: chatMessages,
      // chat rooms
      niceRoomNames: [] as { chatRoom: ChatRoom, niceName: string }[],
      generalRoom,
      // search
      searchedChat: "",
      searchedChatPassword: "",
      searchedChatRequiresPassword: false,
      // create chat
      modalShow: false,
      createdchatName: "",
      createdChatPassword: "",
      createdChatRequiresPassword: false,
      addParticipant: "",
      createdChatParticipants,
      // manage chat
      modalChatAdmin: false,
      managedChatMemberships: managedChatMemberships,
      manageChatParticipants: manageChatParticipants,
      managedChatPassword: "",
      managedChatRequiresPassword: false,
      managedBannedMinutes: 0,
      managedMutedMinutes: 0,
      // friend options
      modalUserActions: {
        show: false,
        userId: "",
        userName: "",
        matchUrl: "",
        currentGameId: "",
      },

    };
  },

  setup() {
    const store = useStore(key);
    const user = store.state.user;

    let roomId = "0";
    return {
      currentRoomId: roomId,
      user,
    };
  },

  async mounted() {
    try {
      this.userFriendships = await getFriendshipsRequest(this.user?.id as string)
      // join chat socket
      this.io.socket.offAny();
      this.io.socket.on("new_message", (message, userName, senderId, roomId, isChallenge) => {
        const msg: ChatMessage = {
          content: message,
          senderName: userName,
          senderId: senderId,
          chatRoomId: roomId,
          isChallenge: isChallenge,
        }

        this.messages.push(msg)
      });

      this.io.socket.on("on_chat_updated", () => {
        this.updateInfo(false);
      })

      // always join general room
      this.isAdmin = false;

      // join queried room
      const requestedRoomId = this.$route.query.roomId as string;
      if (requestedRoomId)
        await this.changeRoom(requestedRoomId)
      else {
        this.generalRoom = await (await getGeneralRoom()).data
        await this.changeRoom(this.generalRoom.id)
      }

    } catch (error: any) {
      handleHttpException(app, error)
    }

  },

  beforeRouteLeave() {
    this.io.socket.offAny();
  },

  watch: {
    messages: {
      handler(newList, oldList) {
        // wait for DOM update
        this.$nextTick(() => {
          this.scroll2bottom();
        });
      },
      deep: true
    }
  },

  methods: {
    async notify() {
      await new Promise(r => setTimeout(r, 1000));
      this.io.socket.emit("chat_update");
    },

    async updateInfo(updateMessages = true) {
      try {
        const memberships = await (await getUserMembershipsReq(this.user?.id as string)).data as Membership[]
        this.userMemberships = memberships
        if (updateMessages)
          this.fetchMessages()
        this.userFriendships = await getFriendshipsRequest(this.user?.id as string)
      }
      catch (error: any) { handleHttpException(app, error) }
    },

    async fetchMessages() {
      this.messages = [];
      const roomMessages = (await getChatRoomMessagesReq(this.currentRoomId)).data
      for (var i in roomMessages) {
        this.messages.push(roomMessages[i]);
      }
      this.scroll2bottom(true)
    },


    getNiceDate(date: string) {
      return moment(date).format('MMMM Do YYYY, h:mm:ss a')
    },

    isDisplayMessage(senderId: string): boolean {
      const friendship = this.userFriendships.find(x => x.friend.id === senderId)
      if (friendship)
        return !friendship.isBlocked
      return true
    },

    async sendMessage(isChallenge = false) {
      if (this.message == "")
        return

      // send through socket
      const msg2emit = {
        roomId: this.currentRoomId,
        userName: this.user.username,
        message: this.message,
        token: localStorage.getItem("token"),
        isChallenge: isChallenge,
      }
      this.io.socket.emit("event_message", msg2emit)

      // post through api
      const outMessage = {
        content: this.message,
        senderId: this.user.id,
        isChallenge: isChallenge,
      }
      try {
        await postChatMessageReq(this.currentRoomId, outMessage)
        this.message = "";
        this.scroll2bottom(true);
      } catch (error: any) {
        handleHttpException(app, error)
        this.fetchMessages()
      }

    },

    async changeRoom(roomId: string, password = "") {
      if (!roomId)
        return

      try {
        // find membership
        this.userMemberships = (await (await getUserMembershipsReq(this.user?.id as string)).data)
        let membership = this.userMemberships.find((membership) => membership.chatRoom.id == roomId)
        if (!membership) {
          const resp = await joinChatRoomReq(roomId, this.user?.id as string, password) // returns membership even if user is already a member of the room
          this.isAdmin = resp.data.isAdmin
          this.userMemberships.push(resp.data)
          membership = resp.data
        }
        if (!membership) {
          throw new Error("You are not a member of this room")
        }
        if (!this.dateOK(membership.bannedUntil)) {
          throw new Error("You are banned from this room")
        }

        this.io.socket.emit("event_leave", this.currentRoomId);

        this.currentMembership = membership
        this.currentRoomId = roomId;
        this.currentRoomName = membership.chatRoom.name;
        const payload = {
          roomId: this.currentRoomId,
          token: localStorage.getItem('token'),
        }
        this.io.socket.emit("event_join", payload);

        this.updateInfo()
      }
      catch (error: any) {
        handleHttpException(app, error)
      }
    },

    async joinRoomBySearchBar(roomName2join: string, password: string) {
      if (roomName2join === "")
        return;

      try {
        const room = (await getChatRoomByNameReq(roomName2join)).data
        if (!room) {
          throw new Error("Room does not exist")
        }
        
        await this.changeRoom(room.id, password)
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },

    async leaveRoom(roomId: any) {
      // remove membership
      const membership = this.userMemberships.find((membership) => membership.chatRoom.id === roomId)
      if (membership) {
        try {
          await deleteChatRoomMembershipsReq(membership.id)
          this.notify()
          this.updateInfo()
        } catch (error: any) {
          handleHttpException(app, error)
        }
      }
    },

    async createChatRoom(roomName: string, password: string, userNames: string[]) {
      try {
        const room = await (await createChatRoomReq(roomName, this.user?.id as string, password)).data
        userNames.forEach(async (username) => {
          try {
            if (username !== this.user?.username && username !== "") {
              const invitee = await getUserByName(username)
              await inviteUsersReq(room.id, invitee.data.id)
            }
          }
          catch (err: any) {
            handleHttpException(app, err)
          }
        })

        this.notify()
        this.changeRoom(room.id)
      }
      catch (err: any) {
        handleHttpException(app, err)
      }
    },

    async kickChatMember(membershipId: string) {
      try {
        await deleteChatRoomMembershipsReq(membershipId)
        this.managedChatMemberships = this.managedChatMemberships.filter((membership) => membership.id !== membershipId)
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },

    async handleSubmitCreateChat() {
      if (this.createdchatName === "") {
        throwFromAsync(app, new Error("Chat name cannot be empty"))
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
        }).catch(err => handleHttpException(app, err));
      }
    },

    async updateManagedChat() {
      this.modalChatAdmin = !this.modalChatAdmin;
      this.manageChatParticipants = []
      this.managedChatPassword = ""
      try {
        this.managedChatMemberships = (await getChatRoomMembershipsReq(this.currentRoomId)).data
        this.managedChatMemberships = this.managedChatMemberships.filter((membership) => membership.user.id !== this.user?.id)
        // transform date to string and remove z at the end so it can be parsed by datepicker
        this.managedChatMemberships.forEach((membership) => {
          membership.bannedUntil = this.time2local(membership.bannedUntil)
          membership.mutedUntil = this.time2local(membership.mutedUntil)
        })
        const room = (await getChatRoomByNameReq(this.currentRoomName)).data
        if (room)
          this.managedChatRequiresPassword = room.isPrivate
      }
      catch (err: any) {
        handleHttpException(app, err)
        return
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
      if (this.managedChatPassword !== "") {
        await updateChatRoomPasswordReq(this.currentRoomId, this.managedChatPassword).catch(err => handleHttpException(app, err))
      }
      // update current chat members
      this.managedChatMemberships.forEach(async (membership) => {
        membership.bannedUntil = this.time2utc(membership.bannedUntil)
        membership.mutedUntil = this.time2utc(membership.mutedUntil)
        try {
          await updateChatRoomMembershipsReq(membership.id, {
            isBanned: membership.isBanned,
            isMuted: membership.isMuted,
            isAdmin: membership.isAdmin,
            bannedUntil: membership.bannedUntil,
            mutedUntil: membership.mutedUntil
          })
        } catch (error: any) {
          handleHttpException(app, error)
        }
      })

      // add new members
      this.manageChatParticipants.forEach(async (username) => {
        try {
          if (username !== this.user?.username && username !== "") {
            const invitee = (await getUserByName(username)).data
            inviteUsersReq(this.currentRoomId, invitee.id)
          }
        } catch (error: any) {
          handleHttpException(app, error)
        }
      })
    },

    async showUserActions(clickedUserId: string) {
      this.modalUserActions.userId = clickedUserId;
      try {
        const clickedUser = await (await getUserById(clickedUserId)).data as IUser
        this.modalUserActions.userName = clickedUser.username;
        this.modalUserActions.show = !this.modalUserActions.show;
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },

    searchFriend() {
      this.$router.push("/user?uuid=" + this.modalUserActions.userId);
    },

    WatchUserGame(player?: string) {
      if (!player)
        return

      getCurrentMatch(player)
        .then(response => {
          this.$router.push("/game?id=" + response.data);
        }).catch(err => handleHttpException(app, err))
    },

    async challengePlayer() {
      getChatRoomMembershipsReq(this.currentMembership.chatRoom.id)
        .then(response => {
          const opponentMembership = response.data.find((membership: any) => membership.user.id != this.user.id)
          if (opponentMembership) {
            challenge(store.state.user.id, opponentMembership.user.id)
              .then(response => {
                const gameId = response.data
                this.message = gameId;
                this.sendMessage(true)

                this.$router.push("/game?id=" + response.data);
              })
          }
        }).catch(err => handleHttpException(app, err))
    },

    async openDirectChat(friendId: string) {
      try {
        const chatRoom = await (await getDirectChatRoomReq(this.user.id, friendId)).data
        this.changeRoom(chatRoom.id)
        this.$router.push("/chats?roomId=" + chatRoom.id);
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },

    dateOK(date: string) {
      if (date == null)
        return true
      return moment(date).isBefore(moment())
    },

    scroll2bottom(force = false) {
      const container = document.querySelector('.chat-area');
      if (!container)
        return

      let isScrolledToBottom = container.scrollTop / container.scrollHeight >= 0.8;
      if (force)
        isScrolledToBottom = true
      if (isScrolledToBottom)
        container.scrollTop = container.scrollHeight;
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

.direct-chat-button {
  all: unset;
  background: burlywood;
  color: white;
  margin: 0 !important;
  border-radius: 5px;
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
  background: #27292f;
  height: 61vh;
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
  border-radius: 10px;
}

.chat-area {
  /*   border: 1px solid #ccc; */
  background: #27292f;
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

.background {}

.message-text {
  overflow-wrap: break-word;
  margin-right: 8px;
  margin-left: 8px
}

.action-button {
  border: 1px solid gray;
  color: black;
  background: rgba(0, 0, 0, 0.5);
}

.find-room-form {
  margin-top: 100px;
  display: flex;
  margin-bottom: 0;
}
</style>