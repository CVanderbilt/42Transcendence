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
  export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
  
    afterInit(server: any) {
      console.log('Socket initialized')
    }
  
    handleConnection(client: any, ...args: any[]) {
      console.log('Client connected to socket👌')

    }
  
    handleDisconnect(client: any) {
      console.log('Client disconnected from socket👋')
    }
  
  
    @SubscribeMessage('event_join')
    handleJoinRoom(client: Socket, room: string) {
      console.log(`alguien se unió al chat ${room}`)
      client.join(`room_${room}`);
    }
  
    @SubscribeMessage('event_message')
    handleIncommingMessage(
      client: Socket,
      payload: { room: string; message: string, username: string, senderId: string, roomId: number },
    ) {
      const { room, message, username, senderId, roomId } = payload;
      console.log(username + " manda el mensaje " + message + " por el chat " + room)
      this.server.to(`room_${room}`).emit('new_message',message, username, senderId, roomId);
    }
  
    @SubscribeMessage('event_leave')
    handleRoomLeave(client: Socket, room:string) {
      console.log(`chao room_${room}`)
      client.leave(`room_${room}`);
    }

    
  }