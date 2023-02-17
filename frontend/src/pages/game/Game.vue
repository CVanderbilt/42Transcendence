<template class="gradient-custom">
  <div class="game-board">
    <div>
      <h1>{{ leftUserName + " " + leftUserScore + "/" + rightUserScore + " " + rightUserName }}</h1>
    </div>
    <canvas ref="canvas" width="500" height="300">
      <line x1="250" y1="0" x2="250" y2="300" style="stroke: #FFFFFF; stroke-width: 3" />
      <text x="20" y="20" style="fill: #FFFFFF; font-size: 15px;">{{leftUserName}}</text>
      <text x="450" y="20" style="fill: #FFFFFF; font-size: 15px;">{{rightUserName}}</text>
    </canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { gameSocketIO } from "../..//main";

import { key, store } from "../..//store/store";

export default defineComponent({
  name: "Game",
  data(): any {
    const io = gameSocketIO();
    const user = store.state.user;
    return {
      io,
      user,
      canvas: null,
      ctx: null,
      ball: null,
      x: 250,
      y: 280,
      dx: 2,
      dy: 2,
      leftPaddleY: 0,
      leftPaddleH: 75,
      leftPaddleW: 10,
      leftUserUpPressed: false,
      leftUserDownPressed: false,
      rightUserDownPressed: false,
      rightUserUpPressed: false,
      rightPaddleY: 0,
      rightPaddleH: 75,
      rightPaddleW: 10,
      leftUserScore: 0,
      rightUserScore: 0,
      leftUserName: "",
      rightUserName: ""
    };
  },
  mounted(): void {
    this.io.socket.emit("event_join_game", {room: "sala1", username: this.user.username});
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.leftPaddleY = (this.canvas.height - this.leftPaddleH) / 2;
    this.rightPaddleY = (this.canvas.height - this.rightPaddleH) / 2;
    document.addEventListener("keydown", this.keyDownHandler, false);
    document.addEventListener("keyup", this.keyUpHandler, false);
    //this.draw();
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
      this.rightUserName = player2name;
      this.leftUserName = player1name;
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
      this.ctx.rect(
        this.canvas.width - 10,
        player2pos,
        10,
        player2Height
      );
      this.ctx.fillStyle = "#009500";
      this.ctx.fill();
      this.ctx.closePath();
    })
  },
  methods: {
    
    keyDownHandler(e: KeyboardEvent): void {
      if (e.key == "Down" || e.key == "ArrowDown") {
        if (this.leftUserDownPressed == false){
        this.io.socket.emit("move", {
          room: "sala1", username: this.user.username, movement: "down", type: "press"
        });
      }
      } else if (e.key == "Up" || e.key == "ArrowUp") {
        if (this.leftUserUpPressed == false){
        this.io.socket.emit("move", {
          room: "sala1", username: this.user.username, movement: "up", type: "press"
        });
      }
      }
    },
    keyUpHandler(e: KeyboardEvent): void {
      if (e.key == "Up" || e.key == "ArrowUp") {
        this.io.socket.emit("move", {
          room: "sala1", username: this.user.username, movement: "up", type: "release"
        });
      } else if (e.key == "Down" || e.key == "ArrowDown") {
        this.io.socket.emit("move", {
          room: "sala1", username: this.user.username, movement: "down", type: "release"
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
  width: 70%;
  margin-top: 2em;
  height: auto;
}

.gradient-custom {
  /* fallback for old browsers */
  height: 100vh;
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








