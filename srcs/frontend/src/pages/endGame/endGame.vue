<script setup lang="ts">
 
 /* eslint-disable */

  import ConfettiExplosion from "vue-confetti-explosion";
</script>

<template>
  <section>
    <div>
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4" style="margin-top: 200px">
            <h1 style="color: white; ;">GAME ENDED</h1>
            <h2> 
              {{ message }}
            </h2>
            <h2> 
              {{ userName }}
            </h2>
            <ConfettiExplosion :stageHeight="1000" style="position: absolute; top: 70px;
  left: 50vw;" v-if="cobetes"/>
          </div>
        </main>
      </div>
    </div>
  </section>
</template>
  
  <script lang="ts">
import { computed, defineComponent } from "vue";
import "@/style/styles.css";
import { getUserById } from "@/api/user";
import { handleHttpException, throwFromAsync } from "@/utils/utils";
import { app } from "@/main";
import { store } from "../../store/store";
declare var require: any;

export default defineComponent({
  name: "EndGame",
  data() {
    let message = "NO MESSAGE TO SHOW"
    let winner = "No winner"
    let cobetes = false;
    return { 
      message,
      winner,
      cobetes
    }
  },

  async mounted(): Promise<void> {
    try {
      if (this.$route.query.reason !== undefined ) {
        this.message = (this.$route.query.reason as string).replace(/_/g, " ");

        if (this.message === "Cant join while in another match") {
          throwFromAsync(app, this.message)
          this.$router.push("/matchmaking")
        }
        // parse message
        if (this.message.split(" ")[0] === "winner") {
          const winnerId = this.message.split(" ").slice(2).join(" "); 
          this.winner = await (await getUserById(winnerId)).data.username;
          this.message = "Winner is " + this.winner;
          if (this.winner === store.state.user.username){
            this.cobetes = true;
            this.message = "YOU ARE THE WINNER!!";
          }
        }
      }
    } catch (error: any) {
      handleHttpException(app, error)
    }
  },

  methods: {
    modifyProfileRoute() {
      this.$router.push("/settings");
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