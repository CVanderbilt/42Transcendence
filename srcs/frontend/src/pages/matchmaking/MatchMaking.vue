<template>
  <section >
        <main>
            <h1 style="color: white; padding-top: 30px;">PONG!</h1>

            <div class="row" style="padding-left: 3%; padding-right: 3%; color: white; height: max-content;">
              <div class="col-xl-12">
                <div class="card mb-4" style="background-color: #27292f;height: 100%;">
                  <div class="card-header" >
                    <h3  style="color: white;">Exhibition Match</h3>
                    
                  </div>
                  <div class="card-body">
                    <div style="margin-bottom: 20px;">
                      <p style="color: white;">Powerups</p>
                      <form style="display: flex; flex-direction: column;">
                        <div>
                          <label for="isSmall" style="color:pink; margin-right: 20px;">Small paddle</label>
                          <input type="checkbox" v-model="options.smallPaddle" />
                        </div>
                        <div>
                          <label for="isFast" style="color:pink; margin-right: 20px;">Fast Serve</label>
                          <input type="checkbox" v-model="options.fastServe" />
                        </div>
                      </form>
                    </div>
                    <b-button v-on:click="enterExhibitionMatch()"
                      style="width: 20vw; background-color: #4e92f2; color:rgb(248, 248, 248); border-radius: 0; margin-top: 30px; margin-right: 1vw;"
                      :disabled="inMatchmaking"
                      :class="{ 'disabled': inMatchmaking }">
                    Search Match
                    </b-button>
                    <b-button v-on:click="cancelMatchmakingAction()"
                  style="width: 20vw; background-color:rgb(255, 82, 82); border-radius: 0; margin-top: 30px; margin-left: 1vw;">
                Cancel matchmaking
                </b-button>
                  </div>
                </div>
              </div>
            </div>
            
            
                
        </main>
  </section>
</template>

<script lang="ts">

 /* eslint-disable */

 
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { key } from "../..//store/store";
//import { cancelMatchmaking, enterCompetitiveGameApi, enterExhibitionGameApi } from "../../api/gameApi"
import "@/style/styles.css";
import { handleHttpException, publishNotification, throwFromAsync } from "@/utils/utils";
import { app, gameSocketIO } from "@/main";

export default defineComponent({
  name: "Matchmaking",
  setup() {
    const store = useStore(key);
    const user = computed(() => store.state.user)
    return {
      user,
    };
  },

  data() {
    const io = gameSocketIO();
    return {
      io,
      options: {
        smallPaddle: false,
        fastServe: false,
      },
      inMatchmaking: false
    };
  },
  mounted() {
    this.io.socket.on("game_start", (payload: {matchId: string}) => {
      this.inMatchmaking = false
      this.$router.push("/game?id=" + payload.matchId);
    });
    this.io.socket.on("matchmaking_canceled", (payload: {msg: string, isError: boolean}) => {
      try {
        publishNotification(payload.msg, payload.isError)
        if (!payload.msg.startsWith("Cant"))
          this.inMatchmaking = false
      } catch (error) {
        this.inMatchmaking = false
        publishNotification("something wrong happened canceling", true)
      }
    });
  },


  methods: {
    cancelMatchmakingAction() {
      this.io.socket.emit("cancel_matchmaking", {userId: this.user.id})
    },
    modifyProfileRoute() {
      this.$router.push("/settings");
    },
    async enterExhibitionMatch() {
      this.inMatchmaking = true
      //alert("entering match with usrId: " + this.user.id)
      this.io.socket.emit("event_search_game", { userId: this.user.id, f: this.options.fastServe, s: this.options.smallPaddle });
    }
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
