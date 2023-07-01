<template>
  <section>
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card bg-dark text-white" style="border-radius: 1rem">
            <div class="card-body p-5 text-center">
              <div class="mb-md-5 mt-md-4 pb-9">
                <div class="
                    d-flex
                    justify-content-center
                    text-center
                    mt-4
                    mb-5
                    pt-1
                  ">
                  <img :src="generateImageURL(lookedUpId)" height="200" style="border-radius: 50%" />
                </div>
                <h2 class="fw-bold mt-1 mb-5 text-uppercase">{{ lookedUpUserName }}</h2>
                <h4 v-if="lookedUpEmail != undefined" class="fw-bold mt-1 mb-5">Email: {{ lookedUpEmail }}</h4>

                <div>
                  <!-- <div style="display: flex; flex-direction: column;"> -->
                  <OpenDirectChatButton v-if="!isBlocked" :userId="userId" :friendId="lookedUpId" />
                  <button v-if="!isBlocked" class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
                    v-on:click="setBlock(true)">
                    Block
                  </button>
                  <button v-else class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
                    v-on:click="setBlock(false)">
                    Unblock
                  </button>
                  <button v-if="!areFriends" class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
                    v-on:click="makeFriend()">
                    Make friend
                  </button>
                  <button v-if="areFriends" class="btn btn-outline-light mt-3 btn-lg px-5" type="submit"
                    v-on:click="unfriend()">
                    Unfriend
                  </button>
                  <p v-if="areFriends">already in friends list</p>
                  <p v-if="!areFriends"> </p>

                  <p v-if="isBlocked">user blocked</p>
                </div>

                <h3 style="margin-top: 50px;">Matches: {{ matches.length }}</h3>
                <div style="height: 200px; overflow-y: scroll;">
                  <div v-for="match in matches" v-bind:key="match.id"
                    style="display: flex; justify-content: space-around;">
                    <p>{{ match.type }}</p>
                    <p>{{ match.opponent?.username }}</p>
                    <p>{{ match.userScore }} - {{ match.opponentScore }}</p>
                    <p>{{ match.userScore > match.opponentScore ? 'WON' : 'LOST' }}</p>
                  </div>
                </div>
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
import { useStore } from "vuex";
import { key } from "../store/store";
import { getUserById } from "../api/user";
import { getFriendshipsRequest, makeFriendshipRequest, setBlockFriendRequest, unfriendRequest } from "@/api/friendshipsApi";
import { generateImageURL, handleHttpException, throwFromAsync } from "@/utils/utils";
import OpenDirectChatButton from "@/components/OpenDirectChatButton.vue";
import { app } from "@/main";
import { Match, getMatchesReq } from "@/api/gameApi";

export default defineComponent({
  name: "User",

  components: {
    OpenDirectChatButton,
  },

  setup() {
    const store = useStore(key);    
    const user = store.state.user;
    const profilePicture = "";
    const _user = computed(() => store.state.user);

    return {
      profilePicture,
      currentUser: _user,
    };
  },

  data() {
    const store = useStore(key);
    const user = store.state.user;
    const matches: Match[] = []

    return {
      lookedUpId: "",
      lookedUpUserName: "",
      lookedUpEmail: "",
      areFriends: false,
      friendshipId: "",
      userId: user.id,
      isBlocked: false,
      matches: matches,
    };
  },
  
  watch: {
    '$route'(to, from) {
      // Check if the query parameters have changed
      if (to.query.uuid !== from.query.uuid) {
        this.lookedUpId = this.$route.query.uuid as string
        console.log("looked id: " + this.lookedUpId)
        this.getUserInfo(this.lookedUpId)
        this.getFriendship()
        getMatchesReq(this.lookedUpId)
        .then(res => this.matches = res.data)
        .catch(err => handleHttpException(app, err))
      }
    }
  },

  async mounted() {
    try {
      
      if (this.$route.query.uuid !== undefined) {
        this.lookedUpId = this.$route.query.uuid as string
        console.log("looked id: " + this.lookedUpId)
        this.getUserInfo(this.lookedUpId)
        this.getFriendship()
        this.matches = (await getMatchesReq(this.lookedUpId)).data
      }
    } catch (error) {
      handleHttpException(app, error)
    }
  },

  methods: {
    async getFriendship() {
      try {
        const friendships = await getFriendshipsRequest(this.currentUser?.id as string)
        const found = friendships.find(f => f.friend.id == this.lookedUpId)
        if (found) {
          this.friendshipId = found.id as string
          this.areFriends = found.isFriend
          this.isBlocked = found.isBlocked
        }
      } catch (err) {
        handleHttpException(app, err)
      }
    },
    generateImageURL,
    getUserInfo(uuid: string) {
      getUserById(uuid)
        .then((response) => {
          console.log("USUARIO:" + response.data.username);
          this.lookedUpUserName = response.data.username;
          this.lookedUpEmail = response.data.email;
        }).catch(err => handleHttpException(app, err))
    },

    async makeFriend() {
      try {
        const res = await makeFriendshipRequest(this.currentUser.id as string, this.lookedUpId)
        if (res.status === 201) {
          this.areFriends = res.data.isFriend
          this.friendshipId = res.data.id
          console.log("are friends: " + this.areFriends)
        }
      } catch (error: any) {
        handleHttpException(app, error)
      }
    },

    unfriend() {
      try {
        unfriendRequest(this.currentUser.id, this.friendshipId)
        this.areFriends = false
        this.friendshipId = ""
      }
      catch (err) {
        handleHttpException(app, err)
      }
    },

    setBlock(isBlocked: boolean) {
      try {
        setBlockFriendRequest(this.currentUser.id, this.friendshipId, isBlocked)
        this.isBlocked = isBlocked
      }
      catch (err) {
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
  background: #3609da;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(193, 209, 237));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(193, 209, 237));
}
</style>