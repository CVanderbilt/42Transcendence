import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchesService } from '../matches/matches.service';

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
  ballpos: { x: number, y: number, dx: number, dy: number },
  gameStatus: "WAITING" | "PLAYING" | "FINISHED" | "MISSING_PLAYER",
  ballSpeed: number,
  paddleHeight: number,
}

const gameRooms: GameRoom[] = [];
const canvasHeight = 300;
const canvasWidth = 500;
const movementDistance = 7;
const ballRadius = 5;
const ballMaxY = canvasHeight - ballRadius;
const ballMinY = ballRadius;
// const ballSpeed = 4; // Configure the ball speed here
// const paddleHeight = 75;

@WebSocketGateway(82, {
  cors: { origin: '*' },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private intervalRefreshId: NodeJS.Timeout;

  constructor(private matchesService: MatchesService) { }

  afterInit(server: any) {
    console.log('Iniciamos server para pong');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(client + 'Alquien se conectó al socket de juegos: ' + client.id);
    //this.matchesService.localGoal("1")
  }

  handleDisconnect(client: any) {
    console.log('handle disconnect');
  }

  @SubscribeMessage('event_join_game')
  async handleJoinRoom(client: Socket, payload: { room: string; username: string }) {
    const { room, username } = payload;
    console.log(`alguien se unió al juego ${room}`);

    const _room = await this.getOrCreateRoom(room);

    if (_room.numPlayers < 2) {
      if (!_room.player1.inGame || !_room.player2.inGame) {
        const player = _room.player1.inGame ? _room.player2 : _room.player1;
        console.log(`Añade ${player === _room.player1 ? 'player 1' : 'player 2'}`);
        _room.numPlayers++;
        player.user = username;
        player.inGame = true;
      }

      const gameServer = this.server;
      _room.gameStatus = "PLAYING";

      this.intervalRefreshId = setInterval(() => {
        if (_room.numPlayers > 1) {
          const calculatePlayerPos = (player: Player) => {
            if (player.downPressed && player.paddlePos < canvasHeight - player.paddleHeight) {
              player.paddlePos += movementDistance;
            } else if (player.upPressed && player.paddlePos > 0) {
              player.paddlePos -= movementDistance;
            }
          };
          calculatePlayerPos(_room.player1);
          calculatePlayerPos(_room.player2);

          if (_room.ballpos.y + _room.ballpos.dy > ballMaxY || _room.ballpos.y + _room.ballpos.dy < ballMinY) {
            _room.ballpos.dy = -_room.ballpos.dy;
          }

          if (_room.ballpos.x + _room.ballpos.dx < 15) {
            {
              if (_room.ballpos.y > _room.player1.paddlePos && _room.ballpos.y < _room.player1.paddlePos + _room.player1.paddleHeight) {
                if (_room.player1.downPressed && _room.ballpos.dy < 2 * _room.ballSpeed) {
                  _room.ballpos.dy += 0.5 * _room.ballSpeed;
                }
                if (_room.player1.upPressed && _room.ballpos.dy > -2 * _room.ballSpeed) {
                  _room.ballpos.dy -= 0.5 * _room.ballSpeed;
                }
                _room.ballpos.dx = -_room.ballpos.dx;
              }
              else if (_room.ballpos.x + _room.ballpos.dx < 0) {
                _room.player2.score++;
                this.matchesService.opponentGoal(room);
                console.log("GOL1");
                _room.ballpos.x = 250;
                _room.ballpos.dx = -_room.ballpos.dx;
                _room.ballpos.dx *= 1.2
              }
            }
          }
          else if (_room.ballpos.x + _room.ballpos.dx > canvasWidth - 15) {
            if (_room.ballpos.y > _room.player2.paddlePos && _room.ballpos.y < _room.player2.paddlePos + _room.player2.paddleHeight) {
              if (_room.player2.downPressed && _room.ballpos.dy < 2 * _room.ballSpeed) {
                _room.ballpos.dy += 0.5 * _room.ballSpeed;
              }
              if (_room.player2.upPressed && _room.ballpos.dy > -2 * _room.ballSpeed) {
                _room.ballpos.dy -= 0.5 * _room.ballSpeed;
              }
              _room.ballpos.dx = -_room.ballpos.dx;
            }
            else if (_room.ballpos.x + _room.ballpos.dx > canvasWidth - 0) {
              _room.ballpos.x = 250;
              _room.player1.score++;
              this.matchesService.localGoal(room);
              console.log("GOL2");
              _room.ballpos.dx = -_room.ballpos.dx;
              _room.ballpos.dx *= 1.2
              //alert("GAME OVER");
              //document.location.reload();
            }
          }
          _room.ballpos.x += _room.ballpos.dx;
          _room.ballpos.y += _room.ballpos.dy;
          gameServer.to(`room_${room}`).emit('draw', _room.ballpos.x, _room.ballpos.y, _room.player1.paddlePos, _room.player1.paddleHeight, _room.player2.paddlePos, _room.player2.paddleHeight, _room.player1.score, _room.player2.score, _room.player1.user, _room.player2.user);
          if (_room.player1.score === 5 || _room.player2.score === 5) {
            _room.gameStatus = "FINISHED";
            clearInterval(this.intervalRefreshId);
          }
        }
      }, 1000 / 60);

      console.log(_room);
    }

    client.on("disconnect", (reason) => {
      const activePlayer = getActivePlayer(_room, username);

      console.log(`${activePlayer} se va`);
      clearInterval(this.intervalRefreshId);
      _room[activePlayer].inGame = false;
      _room.numPlayers--;
      _room.gameStatus = "MISSING_PLAYER";

      if (_room.numPlayers <= 0) {
        delete gameRooms[room];
      }

      console.log(`socket ${client.id} disconnected due to ${reason}`);
    });

    client.join(`room_${room}`);
  }

  @SubscribeMessage('move') //TODO Backend
  handleRightPaddleDown(
    cliWent: Socket,
    payload: { room: string, username: string, movement: "down" | "up", type: "press" | "release" },
  ) {
    const { room, username, movement, type } = payload;
    const _room: GameRoom = gameRooms[room]
    if (!_room) {
      return;
    }

    const activePlayer = getActivePlayer(_room, username)
    if ((movement != "down" && movement != "up")
      || (type != "press" && type != "release")
      || !activePlayer) {
      return;
    }
    const action = movement == "up" ? "upPressed" : "downPressed"

    _room[activePlayer][action] = type == "press"
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(client: Socket, payload: { room: string, username: string }) {
    const { room, username } = payload;
    console.log(`${username} se salio del juego ${room}`)
    client.leave(`room_${room}`);
  }

  getOrCreateRoom = async (roomId: string): Promise<GameRoom> => {
    // get room from db
    const match = await this.matchesService.findOne(roomId)
    // parse powerups
    const ballSpeed = match.powerups.includes("F") ? 4 : 2
    const paddleHeight = match.powerups.includes("S") ? 30 : 75

    const room = gameRooms[roomId] || (gameRooms[roomId] = {
      gameStatus: "WAITING",
      numPlayers: 0,
      player1: createPlayer(paddleHeight),
      player2: createPlayer(paddleHeight),
      ballpos: { x: 250, y: 250, dx: ballSpeed, dy: ballSpeed },
    });

    return room;
  }

}

const getActivePlayer = (room: GameRoom, playerName: string): "player1" | "player2" => {
  if (room.player1.user === playerName) {
    return "player1"
  } else if (room.player2.user === playerName) {
    return "player2"
  }
}



const createPlayer = (paddleHeight: number): Player => ({
  user: "",
  paddlePos: 115,
  paddleHeight: paddleHeight,
  upPressed: false,
  downPressed: false,
  inGame: false,
  score: 0
})