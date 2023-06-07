import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchesService} from '../matches/matches.service';

interface Player {
  user: string;
  paddlePos: number;
  paddleHeight: number;
  upPressed: boolean;
  downPressed: boolean;
  inGame: boolean;
  score: number;
}

interface GameRoom {
  player1: Player,
  player2: Player,
  numPlayers: number,
  ballpos: { x: number, y: number, dx: number, dy: number }
  gameStatus: "WAITING" | "PLAYING" | "FINISHED" | "MISSING_PLAYER"
}

const gameRooms: GameRoom[] = []
const canvasHeight = 300;
const canvasWidth = 500;






@WebSocketGateway(82, {
  cors: { origin: '*' },
})
export class GameGateway


  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor (private matchesService: MatchesService) {}


  afterInit(server: any) {
    console.log('Iniciamos server para pong')
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(client + 'Alquien se conectó al socket de juegos: ' + client.id);
    //this.matchesService.localGoal("1")
  }

  handleDisconnect(client: any) {
    console.log('handle disconnect')
  }


  @SubscribeMessage('event_join_game')
  handleJoinRoom(client: Socket, payload: { room: string, username: string }) {
    const { room, username } = payload
    console.log(`alguien se unió al juego ${room}`)
    
    const _room = getOrCreateRoom(room)
    
    if (_room.numPlayers < 2) {

      if (_room.player1.inGame == false) {
        console.log("Añade player 1")
        _room.numPlayers++
        _room.player1.user = username
        _room.player1.inGame = true
      } else if (_room.player2.inGame == false) {
        console.log("Añade player 2")
        _room.numPlayers++
        _room.player2.user = username
        _room.player2.inGame = true
      }
      
        const gameServer = this.server;
        _room.gameStatus = "PLAYING";
        
        var intervalRefreshId = setInterval( () => {
          if (_room.numPlayers > 1) {
            if (
              _room.player1.downPressed &&
              _room.player1.paddlePos < canvasHeight - _room.player1.paddleHeight
            ) {
              _room.player1.paddlePos += 7;
            } else if (_room.player1.upPressed && _room.player1.paddlePos > 0) {
              _room.player1.paddlePos -= 7;
            }
            if (_room.player2.downPressed && _room.player2.paddlePos < canvasHeight - _room.player2.paddleHeight) {
              _room.player2.paddlePos += 7;
            } else if (_room.player2.upPressed && _room.player2.paddlePos > 0) {
              _room.player2.paddlePos -= 7;
            }

            if (_room.ballpos.y + _room.ballpos.dy > canvasHeight - 5 || _room.ballpos.y + _room.ballpos.dy < 5) {
              _room.ballpos.dy = -_room.ballpos.dy;
            }

            if (_room.ballpos.x + _room.ballpos.dx < 15) {
              {
                if (_room.ballpos.y > _room.player1.paddlePos && _room.ballpos.y < _room.player1.paddlePos + _room.player1.paddleHeight) {
                  if (_room.player1.downPressed && _room.ballpos.dy < 4) {
                    _room.ballpos.dy++
                  }
                  if (_room.player1.upPressed && _room.ballpos.dy > -4) {
                    _room.ballpos.dy--
                  }
                  _room.ballpos.dx = 2;
                } else if (_room.ballpos.x + _room.ballpos.dx < 0) {
                  _room.player2.score++
                  this.matchesService.opponentGoal(room)
                  console.log("GOL1")
                  _room.ballpos.x = 250;
                  if (_room.ballpos.dy > 0)
                  _room.ballpos.dy = 2
                  else
                  _room.ballpos.dy = -2
                }
              }
            } else if (_room.ballpos.x + _room.ballpos.dx > canvasWidth - 15) {
              if (_room.ballpos.y > _room.player2.paddlePos && _room.ballpos.y < _room.player2.paddlePos + _room.player2.paddleHeight) {
                if (_room.player2.downPressed && _room.ballpos.dy < 4) {
                  _room.ballpos.dy++
                }
                if (_room.player2.upPressed && _room.ballpos.dy > -4) {
                  _room.ballpos.dy--
                }
                _room.ballpos.dx = -2;
              } else if (_room.ballpos.x + _room.ballpos.dx > canvasWidth - 0) {
                _room.ballpos.x = 250
                _room.player1.score++;
                this.matchesService.localGoal(room);
                console.log("GOL2")
                if (_room.ballpos.dy > 0)
                _room.ballpos.dy = 2
                else
                _room.ballpos.dy = -2
                //alert("GAME OVER");
                //document.location.reload();
              }
            }
            _room.ballpos.x += _room.ballpos.dx;
            _room.ballpos.y += _room.ballpos.dy;
            gameServer.to(`room_${room}`).emit('draw', _room.ballpos.x, _room.ballpos.y, _room.player1.paddlePos, _room.player1.paddleHeight, _room.player2.paddlePos, _room.player2.paddleHeight, _room.player1.score, _room.player2.score, _room.player1.user, _room.player2.user);
            if (_room.player1.score == 5 || _room.player2.score == 5){
              _room.gameStatus = "FINISHED"
              clearInterval(intervalRefreshId);
            }
          }
        }, 1000 / 60)

      
      console.log(_room)
    }



    client.on("disconnect", (reason) => {
      if (username == _room.player1.user) {
        console.log("jugador 1 se va")
        clearInterval(intervalRefreshId);
        _room.player1.inGame = false;
        _room.numPlayers--;
        _room.gameStatus = "MISSING_PLAYER"
        
      }

      if (username == _room.player2.user) {
        console.log("jugador 2 se va");
        clearInterval(intervalRefreshId);
        _room.player2.inGame = false
        _room.numPlayers--;
        _room.gameStatus = "MISSING_PLAYER";
      }

      if (_room.numPlayers == 0) {
        delete gameRooms[room]
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
    const _room = gameRooms[room]
    if (!room) {
      return ;
    }
    if (_room.player1.user == username) {
      console.log("player1move")

      if (movement == "down" && type == "press") {

        _room.player1.downPressed = true;
      }
      else if (movement == "up" && type == "press") {

        _room.player1.upPressed = true;
      }
      else if (movement == "down" && type == "release") {
        _room.player1.downPressed = false;
      }
      else if (movement == "up" && type == "release") {
        _room.player1.upPressed = false;
      }
    }
    else if (_room.player2.user == username) {
      if (movement == "down" && type == "press") {
        _room.player2.downPressed = true;
      }
      else if (movement == "up" && type == "press") {
        _room.player2.upPressed = true;
      }
      else if (movement == "down" && type == "release") {
        _room.player2.downPressed = false;
      }
      else if (movement == "up" && type == "release") {
        _room.player2.upPressed = false;
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

const getOrCreateRoom = (roomId: string): GameRoom => {
  const room = gameRooms[roomId] || (gameRooms[roomId] = {
  gameStatus: "WAITING",
  numPlayers: 0,
  player1: createPlayer(),
  player2: createPlayer(),
  ballpos: { x: 250, y: 250, dx: 2, dy: 2 },
});

return room;
}

const createPlayer = (): Player => ({
    user: "",
    paddlePos: 115,
    paddleHeight: 75,
    upPressed: false,
    downPressed: false,
    inGame: false,
    score: 0
  })