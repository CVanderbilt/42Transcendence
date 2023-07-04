<template>
  <section >
        <main>
            <h1 style="color: white; padding-top: 30px;">PONG!</h1>

            <div class="row" style="padding-left: 3%; padding-right: 3%; color: white; height: max-content;">
              <div class="col-xl-6">
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
                      style="width: fit-content; background-color: #4e92f2; color:rgb(248, 248, 248); border-radius: 0; margin-top: 30px;"
                      :disabled="inMatchmaking"
                      :class="{ 'disabled': inMatchmaking }">
                    Friendly Match
                    </b-button>
                  </div>
                </div>
              </div>
              <div class="col-xl-6">
                <div class="card mb-4" style="background-color: #27292f; height: 100%;">
                  <div class="card-header">
                    <h3  style="color: white;">Competitive Match</h3>
                    
                  </div>
                  <div class="card-body">
                    <b-button v-on:click="enterCompetitiveMatch()"
                      style="width: fit-content; background-color: #4e92f2; color:rgb(248, 248, 248); border-radius: 0; position: relative; top: 70%; "
                      :disabled="inMatchmaking"
                      :class="{ 'disabled': inMatchmaking }">
                    Competitive Match
                    </b-button>
                  </div>
                </div>
              </div>
            </div>
            
            
                <b-button v-on:click="cancelMatchmakingAction()"
                  style="width: fit-content; background-color:rgb(255, 82, 82); border-radius: 0; margin-top: 30px;">
                Cancel matchmaking
                </b-button>
        </main>
  </section>
</template>

<script lang="ts">

 /* eslint-disable */

 
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { key } from "../..//store/store";
import { cancelMatchmaking, enterCompetitiveGameApi, enterExhibitionGameApi } from "../../api/gameApi";
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
      //alert("game start triggered -> " + payload.matchId)
      this.inMatchmaking = false
      this.$router.push("/game?id=" + payload.matchId);
    });
    this.io.socket.on("matchmaking_canceled", (payload: {msg: string, isError: boolean}) => {
      publishNotification(payload.msg, payload.isError)
      this.inMatchmaking = false
    });
  },


  methods: {
    cancelMatchmakingAction() {
      cancelMatchmaking()
      .then((res) => {
        console.log("matchmaking canceled succeded: " + JSON.stringify(res, null, 2))
        if (this.inMatchmaking)
        publishNotification("Matchmaking cancelation in process...", false)
      })
      .catch((err) => handleHttpException(app, err))
    },
    modifyProfileRoute() {
      this.$router.push("/settings");
    },
    async enterCompetitiveMatch() {
      /*this.inMatchmaking = true
      enterCompetitiveGameApi(this.user.id)
      .then(response => {
        if (response.data.statusCode === 202) {
          this.inMatchmaking = false
          publishNotification("Matchmaking canceled succesfully", false)
        } else {
          //alert("will reroute: " + JSON.stringify(response, null, 2))
          this.$router.push("/game?id=" + response.data);
        }
      }).catch(err => {
        this.inMatchmaking = false
        handleHttpException(app, efrr)
      })//*/
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
