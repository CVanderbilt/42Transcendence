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
import { Mutex } from 'async-mutex';
import { v4 as uuidv4 } from 'uuid';

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


export const user_games_map: string[] = []
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

  //private userIds: { userId: string, sockets: Socket[]}[];
  private lock: Mutex;
  private intervalId: NodeJS.Timeout | null;
  
  constructor(private matchesService: MatchesService, private stateGateway: StateGateway) {
    //this.userIds = [];
    this.lock = new Mutex();
    this.intervalId = null;
    this.contestants = [null, null, null, null]
  }

  private contestants: ({ userId: string, client: Socket } | null)[] = [];

  getContestantIndex(userId: string, f: boolean, s: boolean) {
    for (let idx = 0; idx < this.contestants.length; idx++) {
      const c = this.contestants[idx];
      if (c?.userId) {
        console.log(`  - checking if ${userId} already a contestant with id ${c.userId}`);
      }
      if (userId === c?.userId) {
        console.log("  - already a contestant: " + idx);
        return idx;
      }
    }

    if (f && !s) return 1
    if (!f && s) return 2
    if (f && s) return 3
    return 0
  }

  @SubscribeMessage('cancel_matchmaking')
  async cancelMatchmaking(client: Socket, payload: { userId: string }) {
    console.log("(attemtping matchmakign cancelation)")
    if (user_games_map[payload.userId]) {
      console.log("return, cant cancel ongoing match")
      client.emit("matchmaking_canceled",  { msg: "Cant cancel ongoing match", isError: true })
      return
    }
    const releaseLock = await this.lock.acquire();
    console.log("lock aquired")
    for (let idx = 0; idx < this.contestants.length; idx++) {
      const c = this.contestants[idx];
      if (c?.userId) {
        console.log(`  - checking if ${payload.userId} already a contestant with id ${c.userId}`);
      }
      if (payload.userId === c?.userId) {
        console.log("  - already a contestant: " + idx);
        this.contestants[idx].client.emit("matchmaking_canceled", { msg: "matchmaking succesfully canceled", isError: false })
        this.contestants[idx] = undefined
        releaseLock();
        return
      }
    }
    console.log("lockReleased")
    client.emit("matchmaking_canceled", { msg: "nothing to cancel", isError: true })
    releaseLock();
  }

  @SubscribeMessage('event_search_game')
  async addUserId(client: Socket, payload: { userId: string, f: boolean, s: boolean }): Promise<void> {
    console.log("serach with input: " + JSON.stringify(payload))
    console.log(`wait for lock: ${payload.userId}`)
    const releaseLock = await this.lock.acquire();
    const alreadyMatchId = user_games_map[payload.userId]
    if (alreadyMatchId) {
      client.emit("game_start", { matchId: alreadyMatchId })
      releaseLock()
      return
    }
    console.log(`- aquire lock: ${payload.userId}`)
    try {
      const idx = this.getContestantIndex(payload.userId, payload.f, payload.s)

      console.log("  - Will interact with contestatn in index: " + idx + "; contestant: " + this.contestants[idx]?.userId)
      if (!this.contestants[idx]) {
        console.log("  - no hay contestant, se pone como contestant")
        this.contestants[idx] = { userId: payload.userId, client: client }
      } else if (this.contestants[idx].userId !== payload.userId) {
        //crea match
        const id = uuidv4()
        console.log("  - hay contestant crea match con id: " + id)
        gameRooms[id] = {
          id,
          gameStatus: "WAITING",
          numPlayers: 0,
          player1: {
            user: payload.userId,
            paddlePos: 115,
            paddleHeight: 75,
            upPressed: false,
            downPressed: false,
            inGame: false,
            score: 0
          },
          player2: {
            user: this.contestants[idx].userId,
            paddlePos: 115,
            paddleHeight: 75,
            upPressed: false,
            downPressed: false,
            inGame: false,
            score: 0
          },
          ballpos: { x: 250, y: 250, dx: 2, dy: 2 },
          isCompetitive: true,
          isChallenge: false
        }
        //emite partido a los dos clients
        client.emit("game_start", { matchId: id })
        user_games_map[payload.userId] = id
        user_games_map[this.contestants[idx].userId] = id
        //this.contestants[idx].clients.forEach(c => c.emit("game_start", { matchId: id }))
        this.contestants[idx].client.emit("game_start", { matchId: id })
        this.contestants[idx] = null
      } else {
        console.log("  - el mismo, se hace push de ste cliente en contstant.client")
        this.contestants[idx].client.emit("matchmaking_canceled", { msg: "matchmaking canceled because started searching again", isError: true })
        this.contestants[idx].client = client
      }
    } finally {
      console.log("  - contestants after changes: " + JSON.stringify(this.contestants.map(c => {
        if (c?.userId) return c.userId; return "undefined"
      }), null, 2))
      console.log(`- release lock: ${payload.userId}`)
      releaseLock();
    }
  }

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
      gameServer.to(`room_${room}`).emit('endGame', "Match_doesnt_exist");
      return
    }
    if (usersInGame.has(username) || (user_games_map[username] && user_games_map[username] !== room)) {
      client.emit("endGame", "Cant_join_while_in_another_match")
      return
    }

    const activePlayer = getActivePlayer(_room, username)
    if (activePlayer != null) {
      usersInGame.add(username);
      user_games_map[username] = room
      this.stateGateway.UpdateUserState(username)
      const player = _room[activePlayer]
      if (!player.inGame) {
        player.inGame = true;
        _room.numPlayers++;
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
              this.matchesService.matchAftermath(_room.id, [
                { name: _room.player1.user, score: _room.player1.score },
                { name: _room.player2.user, score: _room.player2.score },
              ], 
              _room.isCompetitive ? "Competitive" : "Exhibition")
              // console.log(`${username} deleting room ${room}(2)`)
              delete gameRooms[_room.id]
              usersInGame.delete(_room.player1.user);
              usersInGame.delete(_room.player2.user);
              user_games_map[_room.player1.user] = undefined
              user_games_map[_room.player2.user] = undefined
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
        usersInGame.delete(_room.player1.user);
        usersInGame.delete(_room.player2.user);
        user_games_map[_room.player1.user] = undefined
        user_games_map[_room.player2.user] = undefined
        delete gameRooms[_room.id]
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
