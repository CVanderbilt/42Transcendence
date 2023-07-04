<template>
  <div>
    <div class="rule" style="margin-top: 100px;">
      <h3>Game Rules</h3>
      <ul style="text-align: left;">
        <li>
          The objective of Pong is to score points by successfully hitting the ball past your opponent's paddle.
        </li>
        <li>
          The game begins with the ball in the center of the field.
        </li>
        <li>
          The ball will move across the field, bouncing off the paddles and the top and bottom walls.
        </li>
        <li>
          Each time the ball successfully passes the opponent's paddle and touches the wall behind it, the serving player
          scores a point.
        </li>
        <li>
          The paddles can only move vertically along the sides of the field. The player on the left side controls the left
          paddle, and the player on the right side controls the right paddle.
        </li>
        <li>
          If a player fails to hit the ball and it touches the wall behind their paddle, their opponent scores a point.
        </li>
        <li>
          The game continues until one player reaches 5 points. The player with the highest score at the end of the game
          is declared the winner.
        </li>
      </ul>
    </div>

    <div class="rule">
      <h3>Match Making</h3>
      <ul style="text-align: left;">
        <li>
          Matches players who has selected the same configuration of power ups.
        </li>
        <li>
          First to show up is first to play.

        </li>
      </ul>
    </div>

    <div class="rule">
      <h3>Power ups</h3>
      <ul style="text-align: left;">
        <li>
          Short paddles: Paddle length is reduced by 50%.
        </li>
        <li>
          Fast serve: Ball speed is increased by 100% during the first serve.
        </li>
      </ul>
    </div>
  </div>
</template>

    
<script lang="ts">
import { defineComponent } from "vue";
import "@/style/styles.css";

export default defineComponent({
  name: "Rules",
});


</script>
    
    <!-- Add "scoped" attribute to ulmit CSS to this component only -->
<style scoped>
.gradient-custom {
  /* fallback for old browsers */
  height: 100vh;
  background: #3609da;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-ulnear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(252, 253, 254));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: ulnear-gradient(to right,
      rgba(4, 8, 22, 0.804),
      rgb(249, 251, 255));
}

.chat-button {
  background: #3466cb;
  color: #dfdfdf;
}

.rule {

  background: #2a2a2a;
  color: #dfdfdf;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;

  margin-left: 20vw;
  margin-right: 20vw;
}

h2 {
  color: #dfdfdf;
  font-size: 60px;
}</style>