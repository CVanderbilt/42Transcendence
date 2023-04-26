<template>
  <section class="vh-100 gradient-custom">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-9">
                <div
                  class="
                    d-flex
                    justify-content-center
                    text-center
                    mt-4
                    mb-5
                    pt-1
                  "
                >
                  <img
                    :src="generateImageURL()"
                    height="200"
                    style="border-radius: 50%"
                  />
                </div>
                <h2 class="fw-bold mt-1 mb-5 text-uppercase">{{ lookedUpUserName }}</h2>
                <h4 class="fw-bold mt-1 mb-5">Email: {{ lookedUpEmail }}</h4>

                <button
                  v-if="!areFriends"
                  class="btn btn-outline-light mt-3 btn-lg px-5"
                  type="submit"
                  v-on:click="makeFriend()"
                >
                Make friend
                </button>
                <button
                  v-if="areFriends"
                  class="btn btn-outline-light mt-3 btn-lg px-5"
                  type="submit"
                  v-on:click="unfriend()"
                >
                Unfriend
                </button>
                <p v-if="areFriends">you guys are friends</p>
                <p v-if="!areFriends"> </p>
                
                <button
                  class="btn btn-outline-light mt-3 btn-lg px-5"
                  type="submit"
                  v-on:click="createChat(lookedUpUserName, lookedUpId)"
                >
                  Chat
                </button>
                <button
                  class="btn btn-outline-light mt-3 btn-lg px-5"
                  type="submit"
                  v-on:click="createGame()"
                >
                  Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
  
  <script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore, mapActions } from "vuex";
import { key, store } from "../store/store";
import { getUserById } from "../api/user";
import axios from "axios";
import { createChatRoomReq, inviteUsersReq } from "@/api/chatApi";
import { getFriendshipsRequest, makeFriendshipRequest, unfriendRequest } from "@/api/friendshipsApi";
import { generateImageURL } from "@/utils/utils";

declare var require: any;

export default defineComponent({
  name: "User",
  setup() {
    const store = useStore(key);
    const profilePicture = "";
    const _user = computed(() => store.state.user);

    return {
      profilePicture,
      currentUser: _user,
    };
  },

  data() {
    return {
      lookedUpId: "",
      lookedUpUserName: "",
      lookedUpEmail: "",
      areFriends: false,
      friendshipId: "",
    };
  },

  async mounted() {
    if (this.$route.query.uuid !== undefined) {
      this.lookedUpId = this.$route.query.uuid as string
      console.log("looked id: " + this.lookedUpId)
      this.getUserInfo(this.lookedUpId)
      this.getFriendship()

    }
  },

  methods: {
    async getFriendship()
    {
      try {
        const friendships = await getFriendshipsRequest(this.currentUser?.id as string)
        const found = friendships.find(f => f.friend.id == this.lookedUpId)
        if (found)
          {
            this.areFriends = true
            this.friendshipId = found.id as string
          }
      } catch(err) {
        console.log(err)
      }
    },
    generateImageURL,
    getUserInfo(uuid: string) {
      getUserById(uuid)
        .then((response) => {
          console.log("USUARIO:" + response.data.username);
          this.lookedUpUserName = response.data.username;
          this.lookedUpEmail = response.data.email;
        })
        .catch((error) => {
          alert("usuario o contraseña incorrectos");
        });
    },

    async createChat(lookedUpUserName: string, lookedUpId: string) {
      const names : string[] = [];
      names.push(this.currentUser?.username as string);
      names.push(lookedUpUserName);
      names.sort();

      const chatRoomName =
        "directMessage¿" + names[0] + "¿" + names[1];

      const UUID = this.currentUser?.id as string;

      console.log(chatRoomName)

      let room;
      try {
        room = (await createChatRoomReq(chatRoomName, UUID, "", true)).data
      } catch(err) {
        alert("Direct chat could not be created");
        console.log(err)
        return
      }
      try {
        inviteUsersReq(room.id, lookedUpId)
      } catch(err) {
        alert("User could not be invited to chat");
        console.log(err)
        return
      }

      this.$router.push("/chats?name=" + chatRoomName);
    },

    createGame(){
      const gameId = "skdlfjhgsdkjfh"
      this.$router.push("/game?id=" + this.lookedUpId);
    },

    openChat() {
      this.$router.push("/chats?id=" + this.lookedUpId);
    },

    onUpload() {
      //const storageRef= storage.ref(`${this.imageData.name}`).put(this.imageData);
    },

    async makeFriend() {
      const res = await makeFriendshipRequest(this.currentUser?.id as string, this.lookedUpId)
      if (res.status === 201) {
        this.areFriends = true;
        this.friendshipId = res.data.id
      }
    },

    unfriend() {
      try {
        unfriendRequest(this.friendshipId)
        this.areFriends = false
        this.friendshipId = ""
      }
      catch (err) {
        alert("could not unfriend")
      }

    },
  },
});
</script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
.gradient-custom {
  /* fallback for old browsers */
  background: #3609da;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(
    to right,
    rgba(4, 8, 22, 0.804),
    rgb(193, 209, 237)
  );

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(
    to right,
    rgba(4, 8, 22, 0.804),
    rgb(193, 209, 237)
  );
}
</style>