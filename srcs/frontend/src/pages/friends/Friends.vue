<template >
  <h1 style="color: white; padding-top: 20px; font-family: 'Geneva'; font-weight:bolder;">Friends</h1>
  <div class="container" style="max-width: 90vw;">
    <div v-for="fshp in friendships" v-bind:key="fshp.id">
      <div class="friend-block">
        <img :src="generateImageURL(fshp.friend.id)" class="rounded-circle" height="80
                " style="border-radius: 50%" alt="" loading="lazy" />
        <h4 style="padding-top: 10px;">{{ fshp.friend.username }}</h4>

        <p v-if="friendsStates.find(x => x.userId == fshp.friend.id)?.state === 'online'" style="color: rgb(0, 255, 72);">
          {{ friendsStates.find(x => x.userId == fshp.friend.id)?.state }}
        </p>
        <p v-else-if="friendsStates.find(x => x.userId == fshp.friend.id)?.state === 'inGame'" style="color: rgb(0, 255, 72);">
          {{ friendsStates.find(x => x.userId == fshp.friend.id)?.state }}
        </p>
        <p v-else style="color: rgb(255, 0, 0);">
          offline
        </p>

        <h3>Victories: {{ fshp.friend.victories }}</h3>
        <h3>Defeats: {{ fshp.friend.defeats }}</h3>
        <h3>Score: {{ fshp.friend.score }}</h3>
        <div v-if="!fshp.isBlocked">
          <OpenDirectChatButton :userId="user.id" :friendId="fshp.friend.id" />
        </div>

        <div>
          <button v-if="!fshp.isBlocked" class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
            v-on:click="setBlock(fshp, true)">Block
          </button>
          <button v-if="fshp.isBlocked" class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
            v-on:click="setBlock(fshp, false)">Unblock
          </button>
          <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
            v-on:click="unfriend(fshp)">Unfriend</button>
        </div>
      </div>
    </div>
  </div>
</template>
    
<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { key } from "../../store/store";

import OpenDirectChatButton from "@/components/OpenDirectChatButton.vue";
import { app, stateSocketIO, useSocketIO } from "@/main";
import "@/style/styles.css";
import { generateImageURL } from "@/utils/utils";
import { handleHttpException } from "@/utils/utils";
import { IFriendship, getFriendshipsRequest, setBlockReq, setFriendReq } from "@/api/friendshipsApi";

interface UserState {
  userId: string;
  state: string;
}

export default defineComponent({
  name: "Friends",

  components: {
    OpenDirectChatButton,
  },

  data() {
    let friendships: IFriendship[] = []
    const store = useStore(key);
    const user = store.state.user;
    const ioChats = useSocketIO()
    
    return {
      ioChats: ioChats,
      friendships: friendships,
      user: user,
    };
  },

  setup() {
    const ioState = stateSocketIO();
    const friendsStates = ref<UserState[]>([])
    const clearStates = () => {
      friendsStates.value = []
    }
    const addState = (updatedState: UserState) => {
      const index = friendsStates.value.findIndex(element => updatedState.userId == element.userId)
      if (index != -1)
        friendsStates.value[index].state = updatedState.state
      else
        friendsStates.value.push(updatedState)
    }

    return {
      ioUserState: ioState,
      friendsStates,
      addState,
      clearStates,
    }
  },

  async mounted() {
    this.getFriendships()

    this.ioUserState.socket.on("user_states", (states: UserState[]) => {
      console.log("user_states")
      console.log(states)

      this.clearStates()

      states.forEach(element => {
        const state: UserState = {
          userId: element.userId,
          state: element.state,
        }
        this.addState(state)
      })
    })

    this.ioUserState.socket.emit("gimme");
  },

  methods: {
    async getFriendships() {
      try {
        const res = await getFriendshipsRequest(this.user?.id as string)
        res.forEach(async (fshp) => {
          if (fshp.isFriend)
          {
            const friend = fshp.friend
            // get nice date
            const date = new Date(friend.createdAt)
            const since = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()
            friend.createdAt = since
            this.friendships.push(fshp)
          }
        })
      } catch (err) {
        handleHttpException(app, err)
      }
    },
    generateImageURL,
    async setBlock(friendship: IFriendship, isBlocked: boolean) {
      try {        
        await setBlockReq(friendship.friend.id, isBlocked)
        const f = this.friendships.find((fshp) => fshp.id === friendship.id)        
        if (f)
          f.isBlocked = isBlocked

        this.ioChats.socket.emit("chat_update");
        } catch (err) {
        handleHttpException(app, err)
      }
    },

    async unfriend(friendship : IFriendship) {
      try {
        await setFriendReq(friendship.friend.id, false)
        this.friendships = this.friendships.filter((fshp) => fshp.id !== friendship.id)
      } catch (err) {
        handleHttpException(app, err)
      }
    },
  },

});
</script>
    
    <!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.chat-button {
  background: #3466cb;
  color: #dfdfdf;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
.friend-block {
  background: #2a2a2a;
  color: #dfdfdf;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  min-width: 17vw;
  max-width: 22vw;
}

h2 {
  color: #dfdfdf;
  font-size: 60px;
}
</style>