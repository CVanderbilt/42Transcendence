<template>
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
                    <button class="allow" v-if="user.isBanned" @click="allowUserAction(user)">Allow</button>
                    <button class="ban" v-if="!user.isBanned" @click="banUserAction(user)">Ban</button>
                    <button class="allow" v-if="!hasAdminRights(user)" @click="promoteUserAction(user)">Promote</button>
                    <button class="ban" v-if="hasAdminRights(user)" @click="demoteUserAction(user)">Demote</button>
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
              </div>
              <div class="list-row-content">
                <div class="list-attribute-box">
                  <div class="manage">
                    <input class="list-attribute-input" type="text" placeholder="userName" v-model="chat.userName">
                    <div class="list-attribute-box">
                      <button class="ban" @click="banUserInChatAction(chat)">Ban</button>
                      <button class="allow" @click="allowUserInChatAction(chat)">Allow</button>
                    </div>
                    <div class="list-attribute-box">
                      <button class="allow" @click="banUserInChatAction(chat)">Promote</button>
                      <button class="ban" @click="allowUserInChatAction(chat)">Demote</button>
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
import { IUser, store } from '@/store/store';
import { defineComponent } from 'vue';
import { getAllUsers, banUser, allowUser, promoteUser, demoteUser } from '@/api/user'
import { allowUserFromChat, banUserFromChat, ChatRoom, deleteChatRoom, demoteUserInChat, getAllChatRoomsReq, promoteUserInChat } from '@/api/chatApi';

interface ChatRoomRow extends ChatRoom {
  userName: string
}
//todo:
// - hacer que list-row-header no scrollee con el contenido de la lista si no hace falta, debería ser estático
// - updatear pagina de chats para aceptar una query con el nombre/id del chat, al entrar si el usuario pertenece al chat, el chat es público o el usuario es un admin entra en el chat y puede participar/leer
// - clikc en chatname redirige a chat, los admins pueden "see al chat channels without joinning", es decir entrar en un chat
// - add notification system for succesful and failed actions -> top banner que aparece en rojo o verde
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
    promoteUserAction(user: IUser) {
      console.log(`Promoting user ${user.id}`);
      promoteUser(user.id)
    },
    demoteUserAction(user: IUser) {
      console.log(`Demoting user ${user.id}`);
      demoteUser(user.id)
    },
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
        banUserFromChat(chat.userName, chat.id)
      }
    },
    allowUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        console.log(`Allowing user: ${chat.userName} in chat: ${chat.name}`)
        allowUserFromChat(chat.userName, chat.id)
      }
    },
    promoteUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        promoteUserInChat(chat.userName, chat.id)
      }
    },
    demoteUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        demoteUserInChat(chat.userName, chat.id)
      }
    },
    destroyChat(chat: ChatRoomRow) {
      deleteChatRoom(chat.id);
    },
    hasAdminRights(user: IUser) {
      return user.role === "ADMIN" || user.role === "OWNER"
    }
  },
  
  mounted() {
    if (!store.state.user || !this.hasAdminRights(store.state.user))
      this.$router.push("/");
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
  width: 50%;
  background-color: #ccc;
  height: 80%;
  position: relative;
  overflow: hidden; /* hide overflowing content */
}

.table-header {
  display: flex;
  justify-content: center;
  width: 100%
}

.list-body {
  position: absolute; /* needed to set height */
  top: 40px; /* height of the .chat-list-header */
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto; /* allow vertical scrolling */
}

.list-row {
  display: grid;
  grid-template-rows: auto 1fr; /* define two rows, one for header and one for content */
  width: 100%;
  height: fit-content;
  border: 1px solid black;
  overflow-x: auto;
}

.list-row-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* each subgrid has three columns */
  grid-gap: 5px; /* optional gap between subgrid items */
  width: fit-content;
}

.list-row-header {
  display: flex;
  width: 100%;
}

.list-attribute-name {
  width:100%;
  min-width: 10ch;
  height: fit-content;
  white-space: nowrap; /* prevent text from wrapping */
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
  overflow: hidden; /* hide overflowing content */
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
