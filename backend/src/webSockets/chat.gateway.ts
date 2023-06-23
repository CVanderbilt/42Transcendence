import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Chats2Service } from 'src/chats2/chats2.service';
  
  @WebSocketGateway(81, {
    cors: { origin: '*' },
  })
  export class ChatGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    // constructor(private chats2service: Chats2Service) {}

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
    handleJoinRoom(client: Socket, room: string, userId: string) {
      // TODO: check if user is banned
      console.log(`alguien se unió al chat ${room}`)
      client.join(`room_${room}`)
    }
  
    @SubscribeMessage('event_message')
    async handleIncommingMessage(
      client: Socket,
      payload: { room: string; message: string, username: string, senderId: string, roomId: number },
    ) {
      const { room, message, username, senderId, roomId } = payload;
      
      // TODO: check if user is muted or banned      
      // const roomMembers = await this.chats2service.findChatRoomMembers(roomId) as any[];
      // const membership = roomMembers.find((m) => m.user.id === senderId);
      // console.log(`membership: ${membership}`)

      this.server.to(`room_${room}`).emit('new_message',message, username, senderId, roomId);
    }
  
    @SubscribeMessage('event_leave')
    handleRoomLeave(client: Socket, room:string) {
      console.log(`chao room_${room}`)
      client.leave(`room_${room}`);
    }

    
  }