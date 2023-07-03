<template>
  <section >
    <div>
      <div id="layoutSidenav_nav"></div>
      <div id="layoutSidenav_content">
        <main>
          <div class="container-fluid px-4 mt-10">
            <h1 class="mt-10" style="color: white; padding-top: 50px; padding-bottom: 30px; font-family: 'Geneva'; font-weight:bolder;">FT_TRASCENDENCE</h1>
            <div class="row">
              <div class="col-xl-6 col-md-12">
                <div class="card bg-primary text-white mb-4">
                  <div class="card-body">Exhibition games played</div>
                  <div class="
                      card-footer
                      align-items-center
                      justify-content-between
                    ">
                    <h2> Total matches: {{ exhibitions.length }}</h2>
                    <div v-for="item in exhibitions" v-bind:key="item.id"
                      style="display: flex; justify-content: space-around;">
                      <p>{{ item.opponent?.username }}</p>
                      <p>{{ item.userScore }} - {{ item.opponentScore }}</p>
                      <p>{{ item.userScore > item.opponentScore ? 'WON' : 'LOST' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-6 col-md-12">
                <div class="card bg-warning text-white mb-4">
                  <div class="card-body">Competition games played</div>
                  <div class="
                      card-footer
                      align-items-center
                      justify-content-between
                    ">
                    <h2> Total matches: {{ competitions.length }}</h2>
                    <div v-for="item in competitions" v-bind:key="item.id"
                      style="display: flex; justify-content: space-around;">
                      <p>{{ item.opponent?.username }}</p>
                      <p>{{ item.userScore }} - {{ item.opponentScore }}</p>
                      <p>{{ item.userScore > item.opponentScore ? 'WON' : 'LOST' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header">
                <h3>LADDER</h3>
                <div style="display: flex; justify-content: center;">
                  <table class="my-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Score</th>
                        <th>Victories</th>
                        <th>Defeats</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in ladder" v-bind:key="item.id"
                        :class="{ 'alternate-row': index % 2 !== 0 }">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.username }}</td>
                        <td>{{ item.score }}</td>
                        <td>{{ item.victories }}</td>
                        <td>{{ item.defeats }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </section>
</template>

<script lang="ts">

 /* eslint-disable */

 
import { defineComponent, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { key } from "../..//store/store";
import "@/style/styles.css";
import { Match, getMatchesReq } from "@/api/gameApi";
import { IUserAPI, getLadder } from "@/api/user";
import { handleHttpException, throwFromAsync } from "@/utils/utils";
import { app } from "@/main";

export default defineComponent({
  name: "Home",

  setup() {
    const store = useStore(key)
    const user = () => store.state.user
    const matches = ref<Match[]>([]);
    const exhibitions = ref<Match[]>([]);
    const competitions = ref<Match[]>([]);
    const ladder = ref<IUserAPI[]>([]);

    async function fetchMatches() {
      const res = (await getMatchesReq(user().id)).data as Match[]
      matches.value = res;
      if (res.length > 0) {
        exhibitions.value = res.filter((m) => m.type.toLowerCase() === "exhibition");
        competitions.value = res.filter((m) => m.type.toLowerCase() === "competitive");
      }
    }

    async function fetchLadder() {
      try {
        const res = (await getLadder()) as IUserAPI[]
        ladder.value = res
      } catch (error: any) {
        handleHttpException(app, error)
      }
    }

    onMounted(fetchMatches)
    onMounted(fetchLadder)

    return {
      user,
      matches,
      exhibitions,
      competitions,
      ladder,
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

.my-table {
  border-collapse: separate;
  border-spacing: 10px;
  /* Espacio entre las celdas */
}

.my-table th,
.my-table td {
  padding: 8px;
  /* Espacio interno de las celdas */
}

.alternate-row {
  background-color: #a3f2f2;
}

.invent{
  height: 90%;
}

</style>
