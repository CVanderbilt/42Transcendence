<template class="gradient-custom">
  <div class="game-board">
    <div>
      <h1>{{ "User1 " + leftUserScore + "/" + rightUserScore + " User2" }}</h1>
    </div>
    <canvas ref="canvas" width="500" height="300"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useSocketIO } from "../..//main";

export default defineComponent({
  name: "Game",
  data(): any {
    const io = useSocketIO();
    return {
      io,
      canvas: null,
      ctx: null,
      ball: null,
      x: 250,
      y: 280,
      dx: 2,
      dy: 2,
      leftPaddleY: null,
      leftPaddleH: 75,
      leftPaddleW: 10,
      leftUserUpPressed: false,
      leftUserDownPressed: false,
      rightUserDownPressed: false,
      rightUserUpPressed: false,
      rightPaddleY: null,
      rightPaddleH: 75,
      rightPaddleW: 10,
      leftUserScore: 0,
      rightUserScore: 0
    };
  },
  mounted(): void {
    this.io.socket.emit("event_join", "sala1");
    this.io.socket.on(("event_movement"), (message: string) => {
    if (
        message == "leftPaddleDown") {
          this.leftUserDownPressed = true
          console.log("leftDown press!")
      } else if (message == "leftPaddleUp") {
        this.leftUserUpPressed = true
        console.log("leftUp press!")
      }
      if (message == "rightPaddleDown") {
        this.rightUserDownPressed = true
        console.log("rightDown press!")
      } else if (message == "rightPaddleUp") {
        this.rightUserUpPressed = true
        console.log("rightUp press!")
      }
    });
    this.io.socket.on(("user_release"), (message: string) => {
      console.log(message);
      if (
        message == "leftPaddleDown") {
          this.leftUserUpPressed = false
          console.log("leftDown release!")

      } else if (message == "leftPaddleUp") {
        this.leftUserDownPressed = false
        console.log("leftUp release!")
      }
      if (message == "rightPaddleDown") {
        this.rightUserDownPressed = false
        console.log("rightDown release!")
      } else if (message == "rightPaddleUp") { 
        this.rightUserUpPressed = false
        console.log("rightUp release!")
      }
    });
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.leftPaddleY = (this.canvas.height - this.leftPaddleH) / 2;
    this.rightPaddleY = (this.canvas.height - this.rightPaddleH) / 2;
    document.addEventListener("keydown", this.keyDownHandler, false);
    document.addEventListener("keyup", this.keyUpHandler, false);
    this.draw();
  },
  methods: {
    draw(): void {
      requestAnimationFrame(this.draw);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.rect(0, this.leftPaddleY, this.leftPaddleW, this.leftPaddleH);
      this.ctx.fillStyle = "#0095DD";
      this.ctx.fill();
      this.ctx.closePath();
      this.ctx.beginPath();
      this.ctx.rect(
        this.canvas.width - this.rightPaddleW,
        this.rightPaddleY,
        this.rightPaddleW,
        this.rightPaddleH
      );
      this.ctx.fillStyle = "#009500";
      this.ctx.fill();
      this.ctx.closePath();
      
      this.x += this.dx;
      this.y += this.dy;
      if (this.y + this.dy > this.canvas.height - 10 || this.y + this.dy < 10) {
        this.dy = -this.dy;
      }
      if (this.x + this.dx < 20) {
        {
          if (this.y > this.leftPaddleY && this.y < this.leftPaddleY + this.leftPaddleH) {
            this.dx = -this.dx;
          } else if (this.x + this.dx < 0) {
            this.rightUserScore++;
            this.x = 250;
          }
        }
      } else if (this.x + this.dx > this.canvas.width - 20) {
        if (this.y > this.rightPaddleY && this.y < this.rightPaddleY + this.rightPaddleH) {
          this.dx = -this.dx;
        } else if (this.x + this.dx > this.canvas.width - 0){
          this.x = 250
          this.leftUserScore++;
          //alert("GAME OVER");
          //document.location.reload();
        }
      }
      if (
        this.leftUserDownPressed &&
        this.leftPaddleY < this.canvas.height - this.leftPaddleH
      ) {
        this.leftPaddleY += 7;
      } else if (this.leftUserUpPressed && this.leftPaddleY > 0) {
        this.leftPaddleY -= 7;
      }
      if (this.rightUserDownPressed && this.rightPaddleY < this.canvas.height - this.rightPaddleH) {
        this.rightPaddleY += 7;
      } else if (this.rightUserUpPressed && this.rightPaddleY > 0) {
        this.rightPaddleY -= 7;
      }
    },
    keyDownHandler(e: KeyboardEvent): void {
      if (e.key == "Down" || e.key == "ArrowDown") {
        if (this.leftUserDownPressed == false){
        this.io.socket.emit("rightPaddleDown", {
          room: "sala1"
        });
      }
      } else if (e.key == "Up" || e.key == "ArrowUp") {
        if (this.leftUserUpPressed == false){
        this.io.socket.emit("rightPaddleUp", {
          room: "sala1"
        });
      }
      } else if (e.key == "w" || e.key == "W") {
        if (this.rightUserUpPressed == false){
        this.io.socket.emit("leftPaddleUp", {
          room: "sala1"
        });
      }
      } else if (e.key == "s" || e.key == "S") {
        if (this.rightUserDownPressed == false){
        this.io.socket.emit("leftPaddleDown", {
          room: "sala1"
        });
      } 
      }
    },
    keyUpHandler(e: KeyboardEvent): void {
      if (e.key == "Up" || e.key == "ArrowUp") {
        this.io.socket.emit("key_release", {
          room: "sala1",
         movement: "rightPaddleUp"
        });
      } else if (e.key == "Down" || e.key == "ArrowDown") {
        this.io.socket.emit("key_release", {
          room: "sala1",
         movement: "rightPaddleDown"
        });
      } else if (e.key == "w" || e.key == "W") {
        this.io.socket.emit("key_release", {
          room: "sala1",
          movement: "leftPaddleDown"
        });
      } else if (e.key == "s" || e.key == "S") {
       this.io.socket.emit("key_release", {
          room: "sala1",
          movement: "leftPaddleUp"
        });
      }
    }
  },
});

/*
if (e.key == "Up" || e.key == "ArrowUp") {
        this.io.socket.emit("key_release", {
          room: "sala1",
         movement: "rightPaddleUp"
        });
      } else if (e.key == "Down" || e.key == "ArrowDown") {
        this.io.socket.emit("key_release", {
          room: "sala1",
         movement: "rightPaddleDown"
        });
      } else if (e.key == "w" || e.key == "W") {
        this.io.socket.emit("key_release", {
          room: "sala1",
          movement: "leftPaddleDown"
        });
      } else if (e.key == "s" || e.key == "S") {
       this.io.socket.emit("key_release", {
          room: "sala1",
          movement: "leftPaddleUp"
        });
      }
*/



</script>
  
  <style>
.game-board {
  margin-top: 6em;
  color: white;
}
canvas {
  background: rgb(0, 0, 0);
  border: 1px solid #333;
  width: 50%;
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








