<template>
  <section class="vh-100 gradient-custom">

    <div>
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-3" style="color: white">PONG!</h1>
            <ol class="breadcrumb mb-4">
              <li class="breadcrumb-item active">Dashboard</li>
            </ol>

            <div class="row">
              <div class="col-xl-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <i class="fas fa-chart-area me-1"></i>
                    <h3>Exhibition Match</h3>
                    <div style="background-color: antiquewhite; margin-bottom: 20px;">
                      <p>Powerups</p>
                      <form style="display: flex; flex-direction: column;">
                        <div>
                          <label for="isSmall" style="margin-right: 20px;">Small paddle</label>
                          <input type="checkbox" v-model="options.smallPaddle" />
                        </div>
                        <div>
                          <label for="isFast" style="margin-right: 20px;">Fast Serve</label>
                          <input type="checkbox" v-model="options.fastServe" />
                        </div>
                      </form>
                    </div>
                    <a class="btn btn-primary" v-on:click="enterExhibitionMatch()">Enter Match</a>
                  </div>
                  <div class="card-body">
                  </div>
                </div>
              </div>
              <div class="col-xl-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <i class="fas fa-chart-area me-1 bg-warning"></i>
                    <h3>Competitive Match</h3>
                    <a class="btn btn-primary" v-on:click="enterCompetitiveMatch()">Enter Match</a>
                  </div>
                  <div class="card-body">
                  </div>
                </div>
              </div>
            </div>
            <div class="card mb-4">
              <div class="card-header">
                <i class="fas fa-table me-1"></i>
                <b-button v-on:click='cancelMatchmakingAction()'
                  style="width: 100%; background-color: #c2c1c1; color:red; border-radius: 0; margin-top: 30px;">
                  Cancel matchmaking
                </b-button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";
import { key } from "../..//store/store";
import { cancelMatchmaking, enterCompetitiveGameApi, enterExhibitionGameApi } from "../../api/gameApi";
import "@/style/styles.css";
import { handleHttpException, publishNotification, throwFromAsync } from "@/utils/utils";
import { app } from "@/main";

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
    return {
      options: {
        smallPaddle: false,
        fastServe: false,
      },
    };
  },


  methods: {
    cancelMatchmakingAction() {
      cancelMatchmaking()
      .then((res) => {console.log("matchmaking canceled succeded: " + JSON.stringify(res, null, 2))})//publishNotification("Matchmaking cancelled successfully, you can match again!!", false))
      .catch((err) => handleHttpException(app, err))
    },
    modifyProfileRoute() {
      this.$router.push("/settings");
    },
    async enterCompetitiveMatch() {
      enterCompetitiveGameApi(this.user.id)
      .then(response => {
        if (response.data.statusCode === 202) {
          publishNotification("Matchmaking canceled succesfully", false)
        } else {
          //alert("will reroute: " + JSON.stringify(response, null, 2))
          this.$router.push("/game?id=" + response.data);
        }
      }).catch(err => handleHttpException(app, err))
    },
    async enterExhibitionMatch() {
      let powerups = "";
      powerups = powerups.concat(this.options.smallPaddle ? "S" : "");
      powerups = powerups.concat(this.options.fastServe ? "F" : "");
      if (powerups === "") {
        powerups = "N";
      }
      enterExhibitionGameApi(this.user.id, powerups)
      .then(response => {
        this.$router.push("/game?id=" + response.data);
      }).catch(err => handleHttpException(app, err))
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
