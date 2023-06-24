import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMembershipEntity } from 'src/chats2/chatEntities.entity';
import { decodeToken } from 'src/utils/utils';
import { Repository } from 'typeorm';

@WebSocketGateway(81, {
  cors: { origin: '*' },
})

export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @InjectRepository(ChatMembershipEntity)
    private readonly chatMembershipsRepo: Repository<ChatMembershipEntity>,
  ) { }

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
  async handleJoinRoom(client: Socket, payload: JoinPayload) {
    console.log(`alguien se unió al chat ${payload.roomName}`)

    try {
      const decodedToken = decodeToken(payload.token)
      const roomId = payload.roomId as unknown as number
      const membership = await this.chatMembershipsRepo.findOne({
        where:
          { user: { id: decodedToken.userId }, chatRoom: { id: roomId } }
      })

      if (membership?.isBanned) {
        console.log(`el usuario ${decodedToken.userId} está baneado`)
        return
      }

      client.join(`room_${payload.roomId}`)
    } catch (error) {
      console.log(error)
    }
  }

  @SubscribeMessage('event_message')
  async handleIncommingMessage(client: Socket, payload: MessagePayload,) {
    try {
      const decodedToken = decodeToken(payload.token)
      const roomId = payload.roomId as unknown as number
      const membership = await this.chatMembershipsRepo.findOne({
        where:
          { user: { id: decodedToken.userId }, chatRoom: { id: roomId } }
      })

      if (membership?.isBanned || membership?.isMuted) {
        console.log(`el usuario ${decodedToken.userId} está baneado o muteado`)
        return
      }

      this.server.to(`room_${payload.roomId}`).emit('new_message', payload.message, payload.userName, decodedToken.userId, roomId, payload.isChallenge);
    } catch (error) {
      console.log(error)
    }
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(client: Socket, room: string) {
    console.log(`chao room_${room}`)
    client.leave(`room_${room}`);
  }
}

interface JoinPayload {
  roomName: string;
  roomId: string;
  userId: string;
  token: string;
}

interface MessagePayload {
  roomId: string;
  userName: string;
  message: string;
  token: string;
  isChallenge: boolean;
}