<template class="gradient-custom">
  <div class="game-board">
    <div>
      <h1>{{ leftUserName + " " + leftUserScore + "/" + rightUserScore + " " + rightUserName }}</h1>
      <b-button v-on:click='leave()'
        style="width:fit-content ; background-color: #c2c1c1; color:red; border-radius: 0; margin-top: 30px;">
        LEAVE
    </b-button>
    </div>
    <canvas ref="canvas" width="500" height="300">
      <line x1="250" y1="0" x2="250" y2="300" style="stroke: #FFFFFF; stroke-width: 3" />
      <text x="20" y="20" style="fill: #FFFFFF; font-size: 15px;">{{ leftUserName }}</text>
      <text x="450" y="20" style="fill: #FFFFFF; font-size: 15px;">{{ rightUserName }}</text>
    </canvas>
  </div>
</template>

<script lang="ts">

 /* eslint-disable */

 
import { getUserById } from "@/api/user";
import { defineComponent } from "vue";
import { app, gameSocketIO, stateSocketIO } from "../..//main";

import { IUser, store } from "../..//store/store";
import { handleHttpException, throwFromAsync } from "@/utils/utils";

export default defineComponent({
  name: "Game",
  data(): any {
    const io = gameSocketIO();
    const stateIo = stateSocketIO();
    const user = store.state.user;
    return {
      inGame: false,
      room: "",
      io,
      stateIo,
      user,
      canvas: null,
      ctx: null,
      leftPaddleY: 0,
      leftPaddleH: 75,
      leftUserUpPressed: false,
      leftUserDownPressed: false,
      rightPaddleY: 0,
      rightPaddleH: 75,
      leftUserScore: 0,
      rightUserScore: 0,
      leftUserName: "",
      rightUserName: "",

    };
  },

  async beforeRouteLeave(to, from, next) {
    this.stateIo.socket.emit("user_state_updated", { userId: this.user.id, state: "online" });
    next()
  },
  beforeUnmount() {
    // Perform cleanup tasks or execute logic before the component is unmounted
    // For example, closing the socket connection
    this.io.socket.close();
  },
  async mounted(): Promise<void> {
    if (this.$route.query.id === undefined) {
      console.log("no id, redirecting to matchmaking")
      this.$router.push("/matchmaking")
      return
    }

    this.room = this.$route.query.id
    this.io.socket.on(("endGame"), (reason: string) => {
      this.inGame = false
      console.log("after endgame inGame: " + this.inGame)
      this.$router.push(`/endGame?reason=${reason}`)
    })
    this.io.socket.on("disconnect", () => {
      console.log("disconect inGame: " + this.inGame)
      if (this.inGame) {
        throwFromAsync(app, "You left an ongoing game, if you were playing try matchmaking to rejoin the game (lag can make you leave a game)")
        this.$router.push("/matchmaking")
      }
    });
    this.io.socket.emit("event_join_game", { room: this.$route.query.id, username: this.user.id })

    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.leftPaddleY = (this.canvas.height - this.leftPaddleH) / 2;
    this.rightPaddleY = (this.canvas.height - this.rightPaddleH) / 2;
    document.addEventListener("keydown", this.keyDownHandler, false);
    document.addEventListener("keyup", this.keyUpHandler, false);
    //this.draw();
    this.io.socket.on(("info"), (roomId: string) => { this.room = roomId; this.inGame = true; console.log("inGame: " + this.inGame)})
    this.io.socket.on(("draw"), (
      ballX: number,
      ballY: number,
      player1pos: number,
      player1Height: number,
      player2pos: number,
      player2Height: number,
      player1score: number,
      player2score: number,
      player1name: string,
      player2name: string,
    ) => {

      if (!this.rightUserName || !this.leftUserName) {
        this.rightUserName = "loading..."
        this.leftUserName = "loading..."
        getUserById(player1name)
        .then((res => { 
          //alert(JSON.stringify(res.data, null, 2))
          this.leftUserName = (res.data as IUser).username 
        })).catch(err => handleHttpException(app, err))
        getUserById(player2name)
        .then((res => {
           this.rightUserName = (res.data as IUser).username 
        })).catch(err => handleHttpException(app, err))
      } else {

      }
      this.leftUserScore = player1score;
      this.rightUserScore = player2score;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.rect(0, player1pos, 10, player1Height);
      this.ctx.fillStyle = "#0095DD";
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.rect(this.canvas.width - 10, player2pos, 10, player2Height);
      this.ctx.fillStyle = "#009500";
      this.ctx.fill();
      this.ctx.closePath();
    })
  },

  methods: {
    leave(): void {
      this.$router.push("/");
    },
    keyDownHandler(e: KeyboardEvent): void {
      if (e.key == "Down" || e.key == "ArrowDown") {
        if (this.leftUserDownPressed == false) {
          this.io.socket.emit("move", {
            room: this.room, username: this.user.id, movement: "down", type: "press", date: Date.now()
          });
        }
      } else if (e.key == "Up" || e.key == "ArrowUp") {
        if (this.leftUserUpPressed == false) {
          this.io.socket.emit("move", {
            room: this.room, username: this.user.id, movement: "up", type: "press", date: Date.now()
          });
        }
      }
    },
    keyUpHandler(e: KeyboardEvent): void {
      if (e.key == "Up" || e.key == "ArrowUp") {
        this.io.socket.emit("move", {
          room: this.room, username: this.user.id, movement: "up", type: "release", date: Date.now()
        });
      } else if (e.key == "Down" || e.key == "ArrowDown") {
        this.io.socket.emit("move", {
          room: this.room, username: this.user.id, movement: "down", type: "release", date: Date.now()
        });
      }
    }
  },
});

</script>
  
<style>
.game-board {
  margin-top: 6em;
  color: white;
}

canvas {
  background: rgb(0, 0, 0);
  border: 1px solid #333;
  width: 60%;
  margin-top: 2em;
  height: auto;
}

.gradient-custom {
  /* fallback for old browsers */
  height: 100vh;
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








