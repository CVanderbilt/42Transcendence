import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as Joi from 'joi'
import { Server, Socket } from 'socket.io';
import { DATE_VALIDATOR, ID_VALIDATOR, usersInGame, validateInput } from 'src/utils/utils';
import { MatchesService} from '../matches/matches.service'; 
import { StateGateway } from 'src/webSockets/state.gateway';

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
  id: string,
  player1: Player,
  player2: Player,
  numPlayers: number,
  ballpos: { x: number, y: number, dx: number, dy: number },
  gameStatus: "WAITING" | "PLAYING" | "FINISHED" | "MISSING_PLAYER",
  isCompetitive: boolean,
  refreshIntervalId? : NodeJS.Timeout,
  isChallenge: boolean
}


export const gameRooms: GameRoom[] = [];
const canvasHeight = 300;
const canvasWidth = 500;
const movementDistance = 7;
const ballRadius = 5;
const ballMaxY = canvasHeight - ballRadius;
const ballMinY = ballRadius;
const goalsForVictory = 7;

@WebSocketGateway(82, {
  cors: { origin: '*' },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private matchesService: MatchesService, private stateGateway: StateGateway) {}

  afterInit(server: any) {
    // console.log('Iniciamos server para pong');
  }

  handleConnection(client: any, ...args: any[]) {
    // console.log(client + 'Alquien se conectó al socket de juegos: ' + client.id);
    //this.matchesService.localGoal("1")
  }

  handleDisconnect(client: any) {
    //todo: no se si aquí o en otro lado, pero countdown para que si un usuario se ausenta mucho tiempo acabe siendo victoria para el otro jugador
    // console.log('handle disconnect')
  }

  @SubscribeMessage('event_join_game')
  async handleJoinRoom(client: Socket, payload: { room: string, username: string }) {
    // console.log('event_join_game' + client.id)
    const { room, username } = payload
    
    // console.log("validating: " + JSON.stringify(payload, null, 2))
    validateInput(Joi.object({
      room: ID_VALIDATOR.required(),
      username: ID_VALIDATOR.required()
  }), payload);
    //todo: revisar, error interno cuando un usuario intenta entrar en uan room o antigua o inexistente, no está claro -> creo q ya está bien
    const _room = gameRooms[room]
    const gameServer = this.server;
    if (!_room){
      //todo: revisar con pablo porq no va esto, si no hay soluciones cutres como revisar que el match exista con una api
      gameServer.to(`room_${room}`).emit('endGame', "Match_doesnt_exist_(si_eso_buscar_en_db_y_diferente_mensaje_para_unexistent_match_y_para_old_match)");
      return
    }
    // console.log("is challenge? " + _room.isChallenge)
    const activePlayer = getActivePlayer(_room, username)
    if (activePlayer != null) {
      usersInGame.add(username);
      this.stateGateway.UpdateUserState(username)
      // console.log(`${username} is ${activePlayer}`)
      if (activePlayer == "player2") {
        // lock player in matchmaking, if locking it failed cancel this
        if (_room.isChallenge && !this.matchesService.acceptChallenge(_room.id, _room.player2.user, _room.player1.user)) {
          gameServer.to(`room_${_room.id}`).emit('endGame', `Match_closed_because_${_room.player2.user}_couldnt_join`);
          this.matchesService.matchEnded(_room.player1.user, _room.player2.user)
          console.log(`${username} deleting room ${room}(1)`)
          delete gameRooms[_room.id]
          usersInGame.delete(username);
          this.stateGateway.UpdateUserState(username)
        }
      }
      // console.log(`${username} is ${activePlayer}`)
      const player = _room[activePlayer]
      if (!player.inGame) {
        player.inGame = true;
        _room.numPlayers++;
        // console.log("numplayer++ = " + _room.numPlayers)
      }
      
      _room.gameStatus = "PLAYING";

        _room.intervalRefreshId = setInterval( async () => {
          if (_room.gameStatus == "FINISHED") {
            clearInterval(_room.intervalRefreshId);
            return ;
          }
          if (_room.numPlayers > 1) {
            const calculatePlayerPos = (player: Player) => {
              if (player.downPressed && player.paddlePos < canvasHeight - player.paddleHeight) {
                player.paddlePos += movementDistance;
              } else if (player.upPressed && player.paddlePos > 0) {
                player.paddlePos -= movementDistance;
              }
            }
            calculatePlayerPos(_room.player1)
            calculatePlayerPos(_room.player2)

      const gameServer = this.server;
      _room.gameStatus = "PLAYING";

      if (_room.ballpos.y + _room.ballpos.dy > ballMaxY || _room.ballpos.y + _room.ballpos.dy < ballMinY) {
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
                if (_room.ballpos.dy > 0)
                _room.ballpos.dy = 2
                else
                _room.ballpos.dy = -2
              }
            }
            _room.ballpos.x += _room.ballpos.dx;
            _room.ballpos.y += _room.ballpos.dy;
            gameServer.to(`room_${_room.id}`).emit('info', _room.id);
            gameServer.to(`room_${_room.id}`).emit('draw', _room.ballpos.x, _room.ballpos.y, _room.player1.paddlePos, _room.player1.paddleHeight, _room.player2.paddlePos, _room.player2.paddleHeight, _room.player1.score, _room.player2.score, _room.player1.user, _room.player2.user);
            if (_room.player1.score == goalsForVictory || _room.player2.score == goalsForVictory){
              _room.gameStatus = "FINISHED"

              clearInterval(_room.intervalRefreshId);
              const winner = _room.player1.score == goalsForVictory ? _room.player1.user : _room.player2.user
              gameServer.to(`room_${_room.id}`).emit('endGame', "winner_is_" + winner);
              this.matchesService.matchEnded(_room.player1.user, _room.player2.user)
              this.matchesService.matchAftermath(_room.id, [
                { name: _room.player1.user, score: _room.player1.score },
                { name: _room.player2.user, score: _room.player2.score },
              ], 
              _room.isCompetitive ? "Competitive" : "Exhibition")
              // console.log(`${username} deleting room ${room}(2)`)
              delete gameRooms[_room.id]
              usersInGame.delete(_room.player1.user);
              usersInGame.delete(_room.player2.user);
              this.stateGateway.UpdateUserState(username)
            }
          }
        }, 1000 / 60);

      // console.log(_room);
    }

    client.on("disconnect", (reason) => {
      const activePlayer = getActivePlayer(_room, username);
      if (!activePlayer) {
        // console.log("Viewer disconected")
        return ;
      }
      usersInGame.delete(username);
      // console.log(`${activePlayer} se va, quedan: ${_room.numPlayer - 1}`);
      clearInterval(_room.intervalRefreshId);
      _room[activePlayer].inGame = false;
      _room.numPlayers--;
      _room.gameStatus = "MISSING_PLAYER";

      if (_room.numPlayers <= 0) {
        //todo: añadir aqui la logica de ver la recompensa/penalización para cada usuario
        this.matchesService.matchEnded(_room.player1.user, _room.player2.user)
        // console.log(`${username} deleting room ${room}(3)`)
        delete gameRooms[_room.id]
        usersInGame.delete(username);
        this.stateGateway.UpdateUserState(username)
      }

      // console.log(`socket ${client.id} disconnected due to ${reason}`);
    });

    client.join(`room_${_room.id}`);
  }

  @SubscribeMessage('move') //TODO Backend
  handleRightPaddleDown(
    cliWent: Socket,
    payload: { room: string, username: string, movement: "down" | "up", type: "press" | "release", date: number },
  ) {
    validateInput(Joi.object({
      room: ID_VALIDATOR.required(),
      username: ID_VALIDATOR.required(),
      movement: Joi.string().valid('down', 'up').required(),
      type: Joi.string().valid('press', 'release').required(),
      date: Joi.number().required()
  }), payload);
    const { room, username, movement, type } = payload;
    const _room: GameRoom = gameRooms[room]
    if (!_room) {
      usersInGame.delete(username);
      this.stateGateway.UpdateUserState(username)
      return;
    }

    const activePlayer = getActivePlayer(_room, username)
    if (!activePlayer) {
      // console.log(`Viewer ${username} cant interact with this room`)
      return ;
    }

    // check for lag
    if (payload.date < Date.now() - 1000) {
      // console.log(`Lag detected for ${username}`)
      cliWent.disconnect()
      return;
    }

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
    validateInput(Joi.object({
      room: ID_VALIDATOR.required(),
      username: ID_VALIDATOR.required()
  }), payload);
    // console.log(`${username} se salio del juego ${room}`)
    client.leave(`room_${room}`);
  }
}

const getActivePlayer = (room: GameRoom, playerName: string): "player1" | "player2" => {
  if (room.player1.user === playerName) {
    return "player1"
  } else if (room.player2.user === playerName) {
    return "player2"
  }
  return null
}
