
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { usersInGame } from 'src/utils/utils';
  
  @WebSocketGateway(84, {
    cors: { origin: '*' },
  })
  

  export class StateGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    
    handleConnection(client: any, ...args: any[]) {}
    
    states = new Array<Connections>();
    
    @WebSocketServer() server: Server;

    // constructor(private readonly  matchesService: MatchesService) {}

    afterInit(server: any) {
      console.log('State Socket initialized')
    }

    handleDisconnect(client: any) {
      console.log('Client disconnected from state socket')

      const userId = this.states.find((item: any) => item.clientId === client.id)?.userId
      if (!userId) 
        return
      
      const msg = {userId: userId, state: "offline"}
      this.states = this.states.filter((item: any) => item.clientId !== client.id)
      if (!this.states.find((item: any) => item.userId === userId)) {
        client.broadcast.emit('user_state_updated', msg);
      }
    }
    
    @SubscribeMessage('get_users_states')
    handleGetUsersStates(client: Socket) {
      const array = Array.from(this.states)
      const msg = array.map((item: any) => {
        return {userId: item.userId, state: usersInGame.has(item.userId) ? "inGame" : "online"}
      })
      client.emit('user_states', msg);
    }

    @SubscribeMessage('update_user_state')
    HandleUserUpdate(client: Socket, payload: { userId: string, state: string }) {
        this.states.push({clientId: client.id, userId: payload.userId})
        const msg = {userId: payload.userId, state: usersInGame.has(payload.userId) ? "inGame" : "online"}
        client.broadcast.emit('user_state_updated', msg);
    }
    
    UpdateGameState(userId: string, state: string)
    {
      // console.log("UpdateGameState: " + userId + " " + state)
      // if (this.states.find((item: any) => item.userId === userId && item.clientId === "0")) {
      //   this.states = this.states.map((item: any) => {
      //     if (item.userId === userId && item.clientId == 0) {
      //       item.state = state
      //     }
      //     return item
      //   })
      // }

      const msg = {userId: userId, state: state}
      this.server.emit('user_state_updated', msg);
    }
  }

  interface Connections {
    clientId: string;
    userId: string;
  }