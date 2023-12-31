import { InjectRepository } from '@nestjs/typeorm';
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
import { ChatMembershipEntity } from 'src/chats2/chatEntities.entity';
import { BOOLEAN_VALIDATOR, CHATROOM_ID_VALIDATOR, ID_VALIDATOR, MESSAGE_VALIDATOR, USERNAME_VALIDATOR, decodeToken, isPastDate, validateInput } from 'src/utils/utils';
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
  }

  handleConnection(client: any, ...args: any[]) {
  }

  handleDisconnect(client: any) {
  }

  @SubscribeMessage('chat_update')
  async handleChatUpdate(client: Socket) {
    console.log("chat update")
    this.server.emit('on_chat_updated');
  }


  @SubscribeMessage('event_join')
  async handleJoinRoom(client: Socket, payload: JoinPayload) {
    try {
      validateInput(Joi.object({
         roomId: CHATROOM_ID_VALIDATOR.required(),
         token: Joi.string().required()
      }), payload)

      const decodedToken = decodeToken(payload.token)
      const roomId = payload.roomId as unknown as number
      const membership = await this.chatMembershipsRepo.findOne({
        where:
          { user: { id: decodedToken.userId }, chatRoom: { id: roomId } }
      })

      if (membership?.isBanned) {
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
      validateInput(Joi.object({
         roomId: CHATROOM_ID_VALIDATOR.required(),
         message: MESSAGE_VALIDATOR.required(),
         userName: USERNAME_VALIDATOR.required(),
         isChallenge: BOOLEAN_VALIDATOR.required(),
         token: Joi.string().required()
      }), payload)

      const decodedToken = decodeToken(payload.token)
      const roomId = payload.roomId as unknown as number
      const membership: ChatMembershipEntity = await this.chatMembershipsRepo.findOne({
        where:
          { user: { id: decodedToken.userId }, chatRoom: { id: roomId } }
      })

      if (decodedToken.role !== "ADMIN" && decodedToken.role !== "OWNER") {
        if (!membership || (!isPastDate(membership.bannedUntil) || !isPastDate(membership.mutedUntil))) {
          return
        }
      }

      this.server.to(`room_${payload.roomId}`).emit('new_message', payload.message, payload.userName, decodedToken.userId, roomId, payload.isChallenge);
    } catch (error) {
      console.log(error)
    }
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(client: Socket, room: string) {
    try {
      validateInput(Joi.object({
        room: CHATROOM_ID_VALIDATOR.required()
      }), { room });
      client.leave(`room_${room}`);
    } catch (error) {
     console.log("error handleroomleave: " + JSON.stringify(error))
    }
  }
}

interface JoinPayload {
  roomId: string;
  token: string;
}

interface MessagePayload {
  roomId: string;
  userName: string;
  message: string;
  token: string;
  isChallenge: boolean;
}