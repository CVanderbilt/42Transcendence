<template>
  <h1>Rules</h1>
  <div style="display: flex; flex-direction: column;">
    <li>
      The objective of Pong is to score points by successfully hitting the ball past your opponent's paddle.
    </li>
    <li>
      The objective of Pong is to score points by successfully hitting the ball past your opponent's paddle.
    </li>
    <li>
      The objective of Pong is to score points by successfully hitting the ball past your opponent's paddle.
    </li>
    <li>
      The objective of Pong is to score points by successfully hitting the ball past your opponent's paddle.
    </li>

  </div>
</template>
    
<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { key } from "../../store/store";
import { getFriendshipsRequest, IFriendship, setBlockFriendRequest, unfriendRequest } from "@/api/friendshipsApi";
import OpenDirectChatButton from "@/components/OpenDirectChatButton.vue";
import { stateSocketIO } from "@/main";
import "@/style/styles.css";

interface UserState {
  userId: string;
  state: string;
}

export default defineComponent({
  name: "Rules",

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
    const io = stateSocketIO();
    const friendsStates = ref<UserState[]>([])
    const updateStates = (updatedState: UserState) => {
      const index = friendsStates.value.findIndex(element => updatedState.userId == element.userId)
      if (index != -1)
        friendsStates.value[index].state = updatedState.state
      else
        friendsStates.value.push(updatedState)
    }

    return {
      io,
      friendsStates,
      updateStates,
    };
  },

  async mounted() {
    this.getFriendships()

    this.io.socket.on("user_states", (states: UserState[]) => {
      states.forEach(element => {
        const state: UserState = {
          userId: element.userId,
          state: element.state,
        }
        this.updateStates(state)
      })
    });

    this.io.socket.emit("get_users_states", this.user.id)

    this.io.socket.on("user_state_updated", (state: UserState) => {
      this.updateStates(state)
    });
  },

  methods: {
    async getFriendships() {
      try {
        const res = await getFriendshipsRequest(this.user?.id as string)
        res.forEach((fshp) => {
          const friend = fshp.friend
          // get nice date
          const date = new Date(friend.createdAt)
          const since = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear()
          friend.createdAt = since
          this.friendships.push(fshp)
        })
      } catch (err) {
        console.log(err)
      }
    },

    createGame(friendId: string) {
      // TODO create game -> refactorizar a un componente
      // const gameId = "skdlfjhgsdkjfh"
      // this.$router.push("/game?id=" + friendId);
    },

    setBlock(friendshipId: string, isBlocked: boolean) {
      try {
        setBlockFriendRequest(friendshipId, isBlocked)
        const f = this.friendships.find((fshp) => fshp.id === friendshipId)
        if (f)
          f.isBlocked = isBlocked
      }
      catch (err) {
        console.log(err)
      }
    },

    unfriend(frienshipId: string) {
      try {
        unfriendRequest(frienshipId)
        this.friendships = this.friendships.filter((fshp) => fshp.id !== frienshipId)
      }
      catch (err) {
        console.log(err)
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