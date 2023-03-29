<template>
  <section class="vh-100 gradient-custom">
    <div>
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-3" style="color: white">GAME ENDED</h1>
            <h1 class="mt-3" style="color: white">WINNER: </h1>
            <ol class="breadcrumb mb-4">
              <li class="breadcrumb-item active">Dashboard</li>
            </ol>
            <div class="card mb-4">
              <div class="card-header">
                <i class="fas fa-table me-1"></i>
                Currently Playing
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
import { useStore, mapActions } from "vuex";
import { key, store } from "../..//store/store";
import { getGameApi,  getPlayerOneApi, getPlayerTwoApi} from "../../api/gameApi";
import "@/style/styles.css";
declare var require: any;

export default defineComponent({
  name: "EndGame",
  setup() {
    const store = useStore(key);
    const user = computed(() => store.state.user);
    return {
      user,
      room: "",
      player1: "",
      player2: ""
    };
  },

  async mounted(): Promise<void> {
    if (this.$route.query.id !== undefined) {
      this.room = this.$route.query.id as string;
    }

    const match = await getGameApi(this.room)
    console.log(match);
  },

  methods: {
    modifyProfileRoute() {
      this.$router.push("/settings");
    },
    getImgURL(profilePicture: string) {
      return require(`@/assets/noPictureProfile.png`);
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