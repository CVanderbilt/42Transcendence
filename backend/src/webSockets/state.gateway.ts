import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway(84, {
    cors: { origin: '*' },
  })
  
  export class StateGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    
    states = new Set();
    
    @WebSocketServer() server: Server;
    afterInit(server: any) {
      console.log('State Socket initialized')
    }

    handleConnection(client: any, ...args: any[]) {
      console.log('Client connected to state socket👋')
    }
    handleDisconnect(client: any) {
      console.log('Client disconnected from state socket')
      const userState = Array.from(this.states).find((item: any) => item.clientId === client.id) as any
      if (!userState) 
        return
      const msg = {userId: userState.userId, state: "offline"}
      this.states.delete(userState)

      client.broadcast.emit('user_state_updated', msg);
    }
    
    @SubscribeMessage('get_users_states')
    handleGetUsersStates(client: Socket) {
      const array = Array.from(this.states)
      const msg = array.map((item: any) => {
        return {userId: item.userId, state: item.state}
      })
      Logger.log(msg)
      client.emit('user_states', msg);
    }

    @SubscribeMessage('update_user_state')
    HandleUserUpdate(client: Socket, payload: { userId: string, state: string }) {
      this.states.add({clientId: client.id, userId: payload.userId, state: payload.state})

      const msg = {userId: payload.userId, state: payload.state}
      client.broadcast.emit('user_state_updated', msg);
    }


  }