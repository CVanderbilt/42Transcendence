
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
import { gameRooms } from 'src/gameSocket/game.gateway';
import { MatchesService } from 'src/matches/matches.service';
  
  @WebSocketGateway(84, {
    cors: { origin: '*' },
  })
  


  export class StateGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    handleConnection(client: any, ...args: any[]) {}
    
    states = new Array<State>();
    
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
        return {userId: item.userId, state: item.state}
      })
      client.emit('user_states', msg);
    }

    @SubscribeMessage('update_user_state')
    HandleUserUpdate(client: Socket, payload: { userId: string, state: string }) {
      const state = this.states.find((item: any) => item.clientId === client.id)
      if (!state) {
        this.states.push({clientId: client.id, userId: payload.userId, state: payload.state})
        const msg = {userId: payload.userId, state: payload.state}
        client.broadcast.emit('user_state_updated', msg);
      }
    }

    UpdateGameState(userId: string, state: string)
    {
      console.log("UpdateGameState: " + userId + " " + state)
      if (this.states.find((item: any) => item.userId === userId && item.clientId === "0")) {
        this.states = this.states.map((item: any) => {
          if (item.userId === userId && item.clientId == 0) {
            item.state = state
          }
          return item
        })
      }
      else {
        this.states.push({clientId: "0", userId: userId, state: state})
      }

      const msg = {userId: userId, state: state}
      this.server.emit('user_state_updated', msg);
    }
  }

  interface State {
    clientId: string;
    userId: string;
    state: string;
  }