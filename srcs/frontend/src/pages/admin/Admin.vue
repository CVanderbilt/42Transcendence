<template>
  <button class="fetch-button" @click="updateInfo">Update</button>
  <div class="admin-page">
    <div class="mainCont" style="align-content: center;">
      <div class="users-list">
        <h5 class="table-header"> Manage users </h5>
        <div class="list-body" ref="usersList">
          <div class="list-row" v-for="user in userList" :key="user.id">
            <div class="list-row-content">
              <div class="list-attribute-name">{{ user.username }}</div>
              <div class="list-attribute-name">{{ user.id }}</div>
              <div class="manage">
                <div class="list-attribute-box">
                  <button class="allow" v-if="user.isBanned" @click="executeAction(allowUserAction, user)">Allow</button>
                  <button class="ban" v-else @click="executeAction(banUserAction, user)">Ban</button>
                  <button class="allow" v-if="!hasAdminRights(user)"
                    @click="executeAction(promoteUserAction, user)">Promote</button>
                  <button class="ban" v-else @click="executeAction(demoteUserAction, user)">Demote</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="chats-list">
        <h5 class="table-header"> Manage chats </h5>
        <div class="list-body">
          <div class="list-row" v-for="chat in chatList" :key="chat.id">
            <div class="list-row-header">
              <b class="list-attribute-name">{{ chat.name }}</b>
              <button @click="openChat(chat.id)">View</button>
            </div>
            <div class="list-row-content">
              <div class="list-attribute-box">
                <div class="manage">
                  <input class="list-attribute-input" type="text" placeholder="userName" v-model="chat.userName">
                  <div class="list-attribute-box">
                    <button class="ban" @click="executeAction(banUserInChatAction, chat)">Ban</button>
                    <button class="allow" @click="executeAction(allowUserInChatAction, chat)">Allow</button>
                  </div>
                  <div class="list-attribute-box">
                    <button class="allow" @click="executeAction(promoteUserInChatAction, chat)">Promote</button>
                    <button class="ban" @click="executeAction(demoteUserInChatAction, chat)">Demote</button>
                  </div>
                </div>
              </div>
              <button class="chatdestroy" @click="destroyChat(chat)">Destroy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

 /* eslint-disable */

 
import { IUser, store } from '@/store/store';
import { defineComponent } from 'vue';
import { getAllUsers, banUser, allowUser, promoteUser, demoteUser } from '@/api/user'
import { allowUserFromChat, banUserFromChat, ChatRoom, deleteChatRoom, demoteUserInChat, getAllChatRoomsReq, getChatRoomMembershipsReq, Membership, promoteUserInChat } from '@/api/chatApi';
import { handleHttpException, publishNotification, throwFromAsync } from '@/utils/utils';
import { app, useSocketIO } from '@/main';

interface ChatRoomRow extends ChatRoom {
  userName: string
  members: Membership[]
}

interface Action {
  (param: any): Promise<void>
}

export default defineComponent({
  data() {
    const userlist: IUser[] = []
    const chatList: ChatRoomRow[] = []
    return {
      userList: userlist,
      chatList: chatList,
    }
  },

  setup() {
    const io = useSocketIO();
    return {
      io
    }
  },
  methods: {

    async updateInfo() {
      try {
        const allusers = await getAllUsers()
        this.userList = allusers
        this.userList.sort((a, b) => a.username.localeCompare(b.username))
        const allrooms = await getAllChatRoomsReq()
        this.chatList = allrooms
        this.chatList.forEach(async room => {
          room.members = await (await getChatRoomMembershipsReq(room.id)).data
          if (room.isDirect) {
            if (room.members.length > 0) {
              let name = room.members[0].user.username
              if (room.members.length > 1)
                name += " - " + room.members[1].user.username
              room.name = name
            }
          }
        })
      } catch (error: any) {
        handleHttpException(app, error)
      }

    },

    async openChat(chatId: string) {
      this.$router.push("/chats?roomId=" + chatId);
    },

    async executeAction(action: Action, param: any) {
      try {
        await action(param)
        publishNotification("Action succesful", false)
        this.updateInfo()
        console.log("update")
        this.io.socket.emit("chat_update")
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },

    async promoteUserAction(user: IUser): Promise<void> {
      if (!user)
        return
      return (await promoteUser(user.id)).data
    },
    async demoteUserAction(user: IUser) {
      if (!user)
        return
      return (await demoteUser(user.id)).data
    },
    async banUserAction(user: IUser) {
      if (!user)
        return
      return (await banUser(user.id)).data
    },
    async allowUserAction(user: IUser) {
      if (!user)
        return
      return (await allowUser(user.id)).data
    },
    async banUserInChatAction(chat: ChatRoomRow) {
      if (!chat || !chat.userName || !chat.id)
        return
      return (await banUserFromChat(chat.userName, chat.id)).data
    },

    async allowUserInChatAction(chat: ChatRoomRow): Promise<void> {
      if (!chat || !chat.userName || !chat.id)
        return
      return (await allowUserFromChat(chat.userName, chat.id)).data
    },

    async promoteUserInChatAction(chat: ChatRoomRow) {
      if (!chat || !chat.userName || !chat.id)
        return
      return (await promoteUserInChat(chat.userName, chat.id)).data
    },
    async demoteUserInChatAction(chat: ChatRoomRow) {
      if (!chat || !chat.userName || !chat.id)
        return
      return (await demoteUserInChat(chat.userName, chat.id)).data
    },
    async destroyChat(chat: ChatRoomRow) {
      let res
      try {
        res = await (await deleteChatRoom(chat.id)).data
      } catch (error: any) { handleHttpException(app, error) }
      this.updateInfo()
      this.io.socket.emit("chat_update")
      return res
    },

    hasAdminRights(user: IUser) {
      return user.role === "ADMIN" || user.role === "OWNER"
    }
  },

  mounted() {
    if (!store.state.user || !this.hasAdminRights(store.state.user))
      this.$router.push("/");
    // const usersList = this.$refs.usersList as HTMLElement;
    // usersList.style.height = `${window.innerHeight - usersList.offsetTop}px`;

    this.updateInfo()

  },
})
</script>
  
<style scoped>
:root {
  align-items: center;
}

.mainCont {
  height: 100%;
  width: 99%;
  justify-content: center;
  display: flex;
  flex-wrap: nowrap;
}

.admin-page {
  display: block;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #787878;
  height: 500em;
}

.users-list {
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 50%;
  background-color: #ccc;
  position: relative;
  overflow: hidden;
  /* hide overflowing content */
}

.table-header {
  display: flex;
  justify-content: center;
  width: 100%
}

.list-body {
  position: absolute;
  /* needed to set height */
  top: 40px;
  /* height of the .chat-list-header */
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;
  /* allow vertical scrolling */
}

.list-row {
  display: grid;
  grid-template-rows: auto 1fr;
  /* define two rows, one for header and one for content */
  height: 20px;
  width: 100%;
  height: fit-content;
  border: 1px solid black;
  overflow-x: scroll;
}

.list-row-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* each subgrid has three columns */
  gap: 5px;
  width: fit-content;
}

.list-row-header {
  display: flex;
  width: 100%;
}

.list-attribute-name {
  width: 100%;
  min-width: 10ch;
  height: fit-content;
  white-space: nowrap;
  /* prevent text from wrapping */
  overflow: scroll;
  position: relative;
  justify-self: center;
  top: 50%;
  transform: translateY(-50%);
}

.list-attribute-input {
  width: 20ch;
  height: 4ch;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.manage {
  display: flex;
  margin-right: 10px;
  flex-wrap: nowrap;
  justify-self: center;
}

.manage input {
  margin-right: 10px;
  padding: 5px;
  justify-self: center;
}

.manage button.ban {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  width: 10ch;
}

.manage button.allow {
  background-color: green;
  width: 10ch;
}

.chatdestroy {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;
}

.chats-list {
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 50%;
  background-color: #ccc;
  height: 80%;
  position: relative;
  overflow: hidden;
  /* hide overflowing content */
}

.list-attribute-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}
</style>
