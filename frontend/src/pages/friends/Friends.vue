<template>
  <h1 style="color: white; padding-top: 20px; padding-bottom: 20px; font-family: 'Geneva'; font-weight:bolder;">Friends</h1>
  <div style="display: flex; flex-direction: row;">
    <div v-for="fshp in friendships" v-bind:key="fshp.id">
      <div class="friend-block">
        <img :src="generateImageURL(fshp.friend.id)" class="rounded-circle" height="80
                " style="border-radius: 50%" alt="" loading="lazy" />
        <h2>{{ fshp.friend.username }}</h2>

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
            v-on:click="setBlock(fshp.id as string, true)">Block
          </button>
          <button v-if="fshp.isBlocked" class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
            v-on:click="setBlock(fshp.id as string, false)">Unblock
          </button>
          <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
            v-on:click="unfriend(fshp.id as string)">Unfriend</button>
        </div>
      </div>
    </div>
  </div>
</template>
    
<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { key } from "../../store/store";
import { getFriendshipsRequest, IFriendship, setBlockFriendRequest, unfriendRequest } from "@/api/friendshipsApi";
import OpenDirectChatButton from "@/components/OpenDirectChatButton.vue";
import { app, stateSocketIO } from "@/main";
import "@/style/styles.css";
import { generateImageURL } from "@/utils/utils";
import { handleHttpException } from "@/utils/utils";

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

    return {
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
    setBlock(friendshipId: string, isBlocked: boolean) {
      try {
        setBlockFriendRequest(this.user.id, friendshipId, isBlocked)
        const f = this.friendships.find((fshp) => fshp.id === friendshipId)
        if (f)
          f.isBlocked = isBlocked
        } catch (err) {
        handleHttpException(app, err)
      }
    },

    unfriend(frienshipId: string) {
      try {
        unfriendRequest(this.user.id, frienshipId)
        this.friendships = this.friendships.filter((fshp) => fshp.id !== frienshipId)
      } catch (err) {
        handleHttpException(app, err)
      }
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

.friend-block {
  background: #2a2a2a;
  color: #dfdfdf;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
}

h2 {
  color: #dfdfdf;
  font-size: 60px;
}
</style>