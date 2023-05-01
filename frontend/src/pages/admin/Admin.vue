<template>
    <div class="admin-page">
      <div class="mainCont" style="align-content: center;">
        <div class="users-list">
          <div class="users-list-header">
            <div class="user-name">User Name</div>
            <div class="user-id">User ID</div>
          </div>
          <div class="users-list-body" ref="usersList">
            <div class="user-row" v-for="user in userList" :key="user.id">
              <div class="user-name">{{ user.username }}</div>
              <div class="user-id">{{ user.id }}</div>
              <button class="allow-button" v-if="user.isBanned" @click="allowUserAction(user)">Allow</button>
              <button class="ban-button" v-if="!user.isBanned" @click="banUserAction(user)">Ban</button>
            </div>
          </div>
        </div>
        <div class="chats-list">
          <div class="chat-list-header">
            <div class="chatname">Chat Name</div>
              <div class="chatname">Ban</div>
              <div class="chatname">Destroy</div>
          </div>
          <div class="chat-list-body">
            <div class="chat-row" v-for="chat in chatList" :key="chat.id">
              <div class="chatname">{{ chat.name }}</div>
              <div class="chatban-box">
                <div class="chatban">
                  <input type="text" placeholder="userName" v-model="chat.userName">
                  <button class="ban" @click="banUserInChatAction(chat)">Ban</button>
                  <button class="allow" @click="allowUserInChatAction(chat)">Allow</button>
                </div>
              </div>
              <button class="chatdestroy" @click="destroyChat(chat)">Destroy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script lang="ts">
import { IUser } from '@/store/store';
import { defineComponent } from 'vue';
import { getAllUsers, banUser, allowUser } from '@/api/user'
import { ChatRoom, getAllChatRoomsReq } from '@/api/chatApi';

/*
  TODO:
    - Añadir boton de dar/quitar privilegios de administrador
    - Añadir algo para poder dar/quitar privilegios sobre un chat
    - Añadir logica para que con los usuarios baneados las letras aparezcan en rojo y
      el botón de ban se cambie por un botón de allow (verde y que llame al método allow)
    - Lógica del backend
*/

interface ChatRoomRow extends ChatRoom {
  userName: string
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
  
  methods: {
    banUserAction(user: IUser) {
      console.log(`Banning user ${user.id}`);
      banUser(user.id)
    },
    allowUserAction(user: IUser) {
      console.log(`Allowing user ${user.id}`);
      allowUser(user.id)
    },
    banUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        console.log(`Banning user: ${chat.userName} in chat: ${chat.name}`)
      }
    },
    allowUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        console.log(`Allowing user: ${chat.userName} in chat: ${chat.name}`)
      }
    },
    destroyChat(chat: ChatRoomRow) {
      console.log(`destroying chat: ${chat.name}`)
    }
  },
  
  mounted() {
    const usersList = this.$refs.usersList as HTMLElement;
    usersList.style.height = `${window.innerHeight - usersList.offsetTop}px`;
    getAllUsers()
      .then(list => this.userList = list)
      .catch(() => alert("Unhandled error when fetching all users for admin page"))
    getAllChatRoomsReq()
      .then(list => { this.chatList = list; console.log(list); console.log(this.chatList) })
      .catch(() => alert("Unhandled error when fetching all chats for admin page"))
  },
})
</script>
  
<style scoped>
:root {
    align-items: center;
}
.mainCont {
    height: 80vh;
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
  height: 100vh;
}

.users-list {
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  width: 50%;
  background-color: #ccc;
  height: 80%;
}
  
.users-list-header {
  display: flex;
  align-items: center;
  justify-items: center;
  height: 40px;
  background-color: #f2f2f2;
  font-weight: bold;
}

.user-name {
    flex-basis: 33.33%;
}
.user-id {
    flex-basis: 33.33;
}
.ban-button {
  flex-basis: 11.11%;
  text-align: center;
}
  
.user-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  width: 1000
}

.users-list-body {
  height: 200px; /* set a fixed height */
  overflow: auto; /* enable overflow scrolling */
}

.admin-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.users-list {
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  align-content: center;
}

.user-name {
    width: fit-content;
    justify-content: center;
}
.user-id {
    width: fit-content;
    justify-content: center;
}
.ban-button {
  width: fit-content;
  text-align: center;
  padding: 10px;
}

.ban-button {
  color: #fff;
  background-color: #d9534f;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.ban-button:hover {
  background-color: #c9302c;
}
.allow-button {
  width: fit-content;
  text-align: center;
  padding: 10px;
}

.allow-button {
  color: #fff;
  background-color: green;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.chat-list-header {
  display: flex;
  align-items: center;
  justify-items: center;
  height: 40px;
  background-color: #f2f2f2;
  font-weight: bold;
}

.chat-list-body {
  /*overflow: scroll;
  align-items: center;
  justify-items: center;*/
  position: absolute; /* needed to set height */
  top: 40px; /* height of the .chat-list-header */
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto; /* allow vertical scrolling */
}

.chat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chatname {
  flex: 1;
  margin-right: 10px;
}

.chatban {
  display: flex;
  margin-right: 10px;
  flex-wrap: nowrap;
}

.chatban input {
  margin-right: 10px;
  padding: 5px;
}

.chatban button {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.chatban button.allow {
  background-color: green;
}

.chatdestroy {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.chats-list {
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 50%;
  background-color: #ccc;
  height: 80%;
  position: relative;
  overflow: hidden; /* hide overflowing content */
}

.chatban-box {
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
