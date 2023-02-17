import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

let numPlayers = {};
let player1 = {};
let player2 = {};
let ballpos = {};
let game = {};
const canvasHeight = 300;
const canvasWidth = 500;






@WebSocketGateway(82, {
  cors: { origin: '*' },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  afterInit(server: any) {
    console.log('Iniciamos server para pong')
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(client + 'Alquien se conectó al socket de juegos: ' + client.id);

  }

  handleDisconnect(client: any) {
    console.log('handle disconnect')
  }


  @SubscribeMessage('event_join_game')
  handleJoinRoom(client: Socket, payload: { room: string, username: string }) {
    const { room, username } = payload
    console.log(`alguien se unió al juego ${room}`)
    if (game[room] == undefined) {
      game[room] = "waiting"
      numPlayers[room] = 0;
      player1[room] = { user: "", paddlePos: 230 / 2, pladdleHeight: 75, upPressed: false, downPressed: false, inGame: false, score: 0 }
      player2[room] = { user: "", paddlePos: 230 / 2, pladdleHeight: 75, upPressed: false, downPressed: false, inGame: false, score: 0 }
      ballpos[room] = { x: 250, y: 250, dx: 2, dy: 2 }
    }
    if (numPlayers[room] < 2) {

      if (player1[room].inGame == false) {
        console.log("Añade player 1")
        numPlayers[room]++
        player1[room].user = username
        player1[room].inGame = true
      } else if (player2[room].inGame == false) {
        console.log("Añade player 2")
        numPlayers[room]++
        player2[room].user = username
        player2[room].inGame = true
      }
      
        const gameServer = this.server;
        game[room] = "playing";
        var intervalRefreshId = setInterval(function () {
          if (numPlayers[room] > 1) {
            gameLoop(room);
            gameServer.to(`room_${room}`).emit('draw', ballpos[room].x, ballpos[room].y, player1[room].paddlePos, player1[room].pladdleHeight, player2[room].paddlePos, player2[room].pladdleHeight, player1[room].score, player2[room].score, player1[room].user, player2[room].user);
            //console.log({ ballX: ballpos[room].x, ballY: ballpos[room].y, player1: player1[room].paddlePos, player1Height: player1[room].pladdleHeight, player2: player2[room].paddlePos, player2Height: player2[room].pladdleHeight })
          }
        }, 1000 / 60)

      
      console.log(numPlayers[room]);
      console.log(player1[room]);
      console.log(player2[room]);
    }



    client.on("disconnect", (reason) => {
      if (username == player1[room].user) {
        console.log("jugador 1 se va")
        clearInterval(intervalRefreshId);
        player1[room].inGame = false;
        numPlayers[room]--;
        game[room] = "missing player"
        
      }

      if (username == player2[room].user) {
        console.log("jugador 2 se va");
        clearInterval(intervalRefreshId);
        player2[room].inGame = false
        numPlayers[room]--;
        game[room] = "missing player";
      }

      if (numPlayers[room] == 0) {
        cleanRoom(room);
      }


      console.log(`socket ${client.id} disconnected due to ${reason}`);
    });

    client.join(`room_${room}`);
  }



  @SubscribeMessage('move') //TODO Backend
  handleRightPaddleDown(
    client: Socket,
    payload: { room: string, username: string, movement: string, type: string },
  ) {
    const { room, username, movement, type } = payload;
    if (player1[room].user == username) {
      console.log("player1move")

      if (movement == "down" && type == "press") {

        player1[room].downPressed = true;
      }
      else if (movement == "up" && type == "press") {

        player1[room].upPressed = true;
      }
      else if (movement == "down" && type == "release") {
        player1[room].downPressed = false;
      }
      else if (movement == "up" && type == "release") {
        player1[room].upPressed = false;
      }
    }
    else if (player2[room].user == username) {
      console.log("player2move")
      if (movement == "down" && type == "press") {
        player2[room].downPressed = true;
      }
      else if (movement == "up" && type == "press") {
        player2[room].upPressed = true;
      }
      else if (movement == "down" && type == "release") {
        player2[room].downPressed = false;
      }
      else if (movement == "up" && type == "release") {
        player2[room].upPressed = false;
      }
    }
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(client: Socket, payload: { room: string, username: string }) {
    const { room, username } = payload;
    console.log(`${username} se salio del juego ${room}`)
    client.leave(`room_${room}`);
  }



}

function cleanRoom(room: string) {
  delete game[room];
  delete numPlayers[room];
  delete player1[room];
  delete player2[room];
  delete ballpos[room];

}


function gameLoop(room: string) {


  if (
    player1[room].downPressed &&
    player1[room].paddlePos < canvasHeight - player1[room].pladdleHeight
  ) {
    player1[room].paddlePos += 7;
  } else if (player1[room].upPressed && player1[room].paddlePos > 0) {
    player1[room].paddlePos -= 7;
  }
  if (player2[room].downPressed && player2[room].paddlePos < canvasHeight - player2[room].pladdleHeight) {
    player2[room].paddlePos += 7;
  } else if (player2[room].upPressed && player2[room].paddlePos > 0) {
    player2[room].paddlePos -= 7;
  }

  if (ballpos[room].y + ballpos[room].dy > canvasHeight - 5 || ballpos[room].y + ballpos[room].dy < 5) {
    ballpos[room].dy = -ballpos[room].dy;
  }

  if (ballpos[room].x + ballpos[room].dx < 15) {
    {
      if (ballpos[room].y > player1[room].paddlePos && ballpos[room].y < player1[room].paddlePos + player1[room].pladdleHeight) {
        if (player1[room].downPressed && ballpos[room].dy < 4) {
          ballpos[room].dy++
        }
        if (player1[room].upPressed && ballpos[room].dy > -4) {
          ballpos[room].dy--
        }
        ballpos[room].dx = 2;
      } else if (ballpos[room].x + ballpos[room].dx < 0) {
        player2[room].score++
        ballpos[room].x = 250;
        if (ballpos[room].dy > 0)
          ballpos[room].dy = 2
        else
          ballpos[room].dy = -2
      }
    }
  } else if (ballpos[room].x + ballpos[room].dx > canvasWidth - 15) {
    if (ballpos[room].y > player2[room].paddlePos && ballpos[room].y < player2[room].paddlePos + player2[room].pladdleHeight) {
      if (player2[room].downPressed && ballpos[room].dy < 4) {
        ballpos[room].dy++
      }
      if (player2[room].upPressed && ballpos[room].dy > -4) {
        ballpos[room].dy--
      }
      ballpos[room].dx = -2;
    } else if (ballpos[room].x + ballpos[room].dx > canvasWidth - 0) {
      ballpos[room].x = 250
      player1[room].score++;
      if (ballpos[room].dy > 0)
        ballpos[room].dy = 2
      else
        ballpos[room].dy = -2
      //alert("GAME OVER");
      //document.location.reload();
    }
  }
  ballpos[room].x += ballpos[room].dx;
  ballpos[room].y += ballpos[room].dy;
}
