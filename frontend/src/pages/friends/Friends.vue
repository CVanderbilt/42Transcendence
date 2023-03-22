<template>
  <h1>Friends</h1>
  <div style="display: flex; flex-direction: row;">
    <div v-for="fshp in friendships" v-bind:key="fshp.id">
      <div class="friend-block">
        <h2>{{ fshp.friend.username }}</h2>
        <h3>Member since<br>{{ fshp.friend.createdAt }}</h3>
        <h3>Victories: {{ fshp.friend.victories }}</h3>
        <h3>Defeats: {{ fshp.friend.defeats }}</h3>
        <h3>Ladder position: ??</h3>
        <div v-if="!fshp.isBlocked">
          <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
            v-on:click="openChat(fshp.friend.username, fshp.friend.id)">
            Chat
          </button>
          <button class="btn btn-outline-light mt-3 btn-lg px-5" type="submit" v-on:click="createGame(fshp.friend.id)">
            Game
          </button>
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
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { key } from "../../store/store";
import "@/style/styles.css";
import { getFriendshipsRequest, IFriendship, setBlockFriendRequest, unfriendRequest } from "@/api/friendshipsApi";
import { getChatRoomReq, inviteUsersReq } from "@/api/chatApi";

export default defineComponent({
  name: "Friends",

  data() {
    let friendships: IFriendship[] = []
    return {
      friendships: friendships,
    };
  },

  setup() {
    const store = useStore(key);
    const user = store.state.user;
    return {
      user,
    };
  },

  async mounted() {
    this.getFriendships()
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
          console.log(since)
          friend.createdAt = since
          this.friendships.push(fshp)
        })
      } catch (err) {
        console.log(err)
      }
    },

    // TODO refactorizar a un componente
    async openChat(friendName: string, friendId: string) {
      const names: string[] = [];
      names.push(this.user?.username as string);
      names.push(friendName);
      names.sort();

      const chatRoomName =
        "" + names[0] + "&" + names[1];

      const UUID = this.user?.id as string;

      console.log(chatRoomName)

      let room;
      try {
        room = (await getChatRoomReq(chatRoomName, UUID, "", true)).data
      } catch (err) {
        alert("Direct chat could not be created");
        console.log(err)
        return
      }
      try {
        inviteUsersReq(room.id, friendId)
      } catch (err) {
        alert("User could not be invited to chat");
        console.log(err)
        return
      }

      this.$router.push("/chats?name=" + chatRoomName);
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