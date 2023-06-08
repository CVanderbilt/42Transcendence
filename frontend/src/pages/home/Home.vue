<template>
  <section class="vh-100 gradient-custom">

    <div>
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4">
            <h1 class="mt-0" style="color: white">FT_TRASCENDENCE</h1>
            <ol class="breadcrumb mb-4">
              <li class="breadcrumb-item active">Dashboard</li>
            </ol>
            <div class="row">
              <div class="col-xl-3 col-md-6">
                <div class="card bg-primary text-white mb-4">
                  <div class="card-body">Games played</div>
                  <div class="
                      card-footer
                      align-items-center
                      justify-content-between
                    ">

                    <h2> Total matches: {{ matches.length }}</h2>
                    <div v-for="item in matches" v-bind:key="item.id" style="display: flex; justify-content: space-around;">
                    <p>{{ item.opponent?.username }}</p>
                    <p>{{  item.playerScore }} - {{ item.opponentScore }}</p>
                    <p>{{ item.playerScore > item.opponentScore ? 'WON' : 'LOST' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-3 col-md-6">
                <div class="card bg-warning text-white mb-4">
                  <div class="card-body">Warning Card</div>
                  <div class="
                      card-footer
                      d-flex
                      align-items-center
                      justify-content-between
                    ">
                    <a class="small text-white stretched-link" href="#">View Details</a>
                    <div class="small text-white">
                      <i class="fas fa-angle-right"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-3 col-md-6">
                <div class="card bg-success text-white mb-4">
                  <div class="card-body">Success Card</div>
                  <div class="
                      card-footer
                      d-flex
                      align-items-center
                      justify-content-between
                    ">
                    <a class="small text-white stretched-link" href="#">View Details</a>
                    <div class="small text-white">
                      <i class="fas fa-angle-right"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-3 col-md-6">
                <div class="card bg-danger text-white mb-4">
                  <div class="card-body">Danger Card</div>
                  <div class="
                      card-footer
                      d-flex
                      align-items-center
                      justify-content-between
                    ">
                    <a class="small text-white stretched-link" href="#">View Details</a>
                    <div class="small text-white">
                      <i class="fas fa-angle-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-xl-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <i class="fas fa-chart-area me-1"></i>
                    Area Chart Example
                  </div>
                  <div class="card-body">
                  </div>
                </div>
              </div>
              <div class="col-xl-6">
                <div class="card mb-4">
                  <div class="card-header">
                    <i class="fas fa-chart-bar me-1"></i>
                    Bar Chart Example
                  </div>
                  <div class="card-body">

                  </div>
                </div>
              </div>
            </div>
            <div class="card mb-4">
              <div class="card-header">
                <i class="fas fa-table me-1"></i>
                DataTable Example
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { key } from "../..//store/store";
import "@/style/styles.css";
import { Match, getMatchesReq as getMatchesForUserReq } from "@/api/gameApi";

declare var require: any;

export default defineComponent({
  name: "Home",
  setup() {
    const store = useStore(key)
    const user = () => store.state.user
    const matches = ref<Match[]>([]);

    async function fetchMatches() {
      const res = (await getMatchesForUserReq(user().id)).data as Match[]
      matches.value = res;
    }

    onMounted(fetchMatches)

    return {
      user,
      matches,
    };
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
  background: -webkit-linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(193, 209, 237));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(193, 209, 237));
}
</style>
