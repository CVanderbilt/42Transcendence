import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';


  
  @WebSocketGateway(81, {
    cors: { origin: '*' },
  })
  export class GameGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
  
    afterInit(server: any) {
      console.log('Iniciamos server para pong')
    }
  
    handleConnection(client: any, ...args: any[]) {
      console.log(client + 'Alquien se conectó a una partida👌');
    }
  
    handleDisconnect(client: any) {
      console.log('ALguien se fue de la partida!')
    }
  
  
    @SubscribeMessage('event_join')
    handleJoinRoom(client: Socket, gameId: string) {
        console.log(`alguien se unió al juego ${gameId}`)
      client.join(`room_${gameId}`);
    }
  
    @SubscribeMessage('leftPaddleUp') //TODO Backend
    handleLeftPaddleUp(
      client: Socket,
      payload: { room: string;},
    ) {
      const { room } = payload;
      console.log("left paddle moves up!")
      this.server.to(`room_${room}`).emit('event_movement', 'leftPaddleUp');
    }

    @SubscribeMessage('rightPaddleUp') //TODO Backend
    handleRightPaddleUp(
      client: Socket,
      payload: { room: string;},
    ) {
      const { room } = payload;
      console.log("right paddle moves up!")
      this.server.to(`room_${room}`).emit('event_movement','rightPaddleUp');
    }

    @SubscribeMessage('leftPaddleDown') //TODO Backend
    handleLeftPaddleDown(
      client: Socket,
      payload: { room: string;},
    ) {
      const { room } = payload; 
      console.log("left paddle moves down!")
      this.server.to(`room_${room}`).emit('event_movement','leftPaddleDown');
    }

    @SubscribeMessage('rightPaddleDown') //TODO Backend
    handleRightPaddleDown(
      client: Socket,
      payload: { room: string;},
    ) {
      const { room } = payload;
      console.log("right paddle moves down!")
      this.server.to(`room_${room}`).emit('event_movement','rightPaddleDown');
    }

    @SubscribeMessage('key_release') //TODO Backend
    handleKeyRelease(
      client: Socket,
      payload: { room: string, movement: string;},
    ) {
      const { room, movement } = payload;
      console.log("movement")
      this.server.to(`room_${room}`).emit('user_release',movement);
    }

  
    @SubscribeMessage('event_leave')
    handleRoomLeave(client: Socket, room:string) {
      console.log(`se salio del juego ${room}`)
      client.leave(`room_${room}`);
    }
  }