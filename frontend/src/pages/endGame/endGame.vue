<template>
  <section class="vh-100 gradient-custom">
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
import { throwFromAsync } from "@/utils/utils";
import { app } from "@/main";
declare var require: any;

export default defineComponent({
  name: "EndGame",
  data() {
    let message = "NO MESSAGE TO SHOW"
    return { 
      message,
    }
  },

  async mounted(): Promise<void> {
    try {
      if (this.$route.query.reason !== undefined ) {
        this.message = (this.$route.query.reason as string).replace(/_/g, " ");
        
        // parse message
        if (this.message.split(" ")[0] === "winner") {
          const winnerId = this.message.split(" ").slice(2).join(" "); 
          this.message = "Winner is " + await (await getUserById(winnerId)).data.username;
        }
      }
    } catch (error: any) {
      throwFromAsync(app, error)
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