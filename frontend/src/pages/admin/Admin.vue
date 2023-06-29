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
                  <button class="allow" v-if="!hasAdminRights(user)" @click="executeAction(promoteUserAction, user)">Promote</button>
                  <button class="ban" v-else @click="executeAction(demoteUserAction ,user)">Demote</button>
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
                    <button class="ban" @click="executeAction(banUserInChatAction, chat)">Ban</button>
                    <button class="allow" @click="executeAction(allowUserInChatAction,chat)">Allow</button>
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
import { IUser, store } from '@/store/store';
import { defineComponent } from 'vue';
import { getAllUsers, banUser, allowUser, promoteUser, demoteUser } from '@/api/user'
import { allowUserFromChat, banUserFromChat, ChatRoom, deleteChatRoom, demoteUserInChat, getAllChatRoomsReq, getChatRoomMembershipsReq, Membership, promoteUserInChat } from '@/api/chatApi';
import { publishNotification, throwFromAsync } from '@/utils/utils';
import { app } from '@/main';

interface ChatRoomRow extends ChatRoom {
  userName: string
}

interface Action {
  (param: any): void
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
    
  
    updateInfo() {
      getAllUsers()
      .then(list => {
        this.userList = list
        getAllChatRoomsReq()
          .then(list => {
            this.chatList = list;
            this.chatList.forEach(async element => {
              console.log(element.name)
              if (element.isDirect) {
                console.log("is direct")
                getChatRoomMembershipsReq(element.id)
                .then(response => {
                  const memberships: Membership[] = response.data
                  if (!memberships.length) {
                    let name = memberships[0].user.username
                    if (memberships.length > 1)
                      name += " - " + memberships[1].user.username
                    element.name = name
                    console.log(element.name)
                  } else throwFromAsync(app, new Error("Cant get chatRoomMemberships"))
                })
              }
            });
          }).catch(err => throwFromAsync(app, err))
      }).catch(err => throwFromAsync(app, err))
    },

    async executeAction(action: Action, param: any) {
      try {
        await action(param)
        this.updateInfo()
      } catch (error: any) {
        throwFromAsync(app, error.message)
      }
    },

    promoteUserAction(user: IUser) {
      publishNotification(`Promoting user ${user.id}`, false)
      promoteUser(user.id)
    },
    demoteUserAction(user: IUser) {
      publishNotification(`Demoting user ${user.id}`, false)
      demoteUser(user.id)
    },
    banUserAction(user: IUser) {
      publishNotification(`Banning user ${user.id}`, false)
      banUser(user.id)
    },
    allowUserAction(user: IUser) {
      publishNotification(`Allowing user ${user.id}`, false)
      allowUser(user.id)
    },
    banUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        publishNotification(`Banning user: ${chat.userName} in chat: ${chat.name}`, false)
        banUserFromChat(chat.userName, chat.id).catch(err => throwFromAsync(app, err))
      }
    },
    allowUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        publishNotification(`Allowing user: ${chat.userName} in chat: ${chat.name}`, false)
        allowUserFromChat(chat.userName, chat.id).catch(err => throwFromAsync(app, err))
      }
    },
    promoteUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        publishNotification(`Promoting user: ${chat.userName} in chat: ${chat.name}`, false)
        promoteUserInChat(chat.userName, chat.id).catch(err => throwFromAsync(app, err))
      }
    },
    demoteUserInChatAction(chat: ChatRoomRow) {
      if (chat.userName) {
        publishNotification(`Demoting user: ${chat.userName} in chat: ${chat.name}`, false)
        demoteUserInChat(chat.userName, chat.id).catch(err => throwFromAsync(app, err))
      }
    },
    destroyChat(chat: ChatRoomRow) {
      publishNotification(`Deleting chat ${chat.name}`, false)
      deleteChatRoom(chat.id).catch(err => throwFromAsync(app, err))
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
