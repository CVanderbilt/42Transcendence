
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
import { ID_VALIDATOR, usersInGame, validateInput } from 'src/utils/utils';

@WebSocketGateway(84, {
  cors: { origin: '*' },
})


// export class StateGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

//   handleConnection(client: any, ...args: any[]) { }

//   @WebSocketServer() server: Server;

//   afterInit(server: any) {
//     console.log('State Socket initialized')
//   }

//   aliveUsers = new Array<string>();
  
//   @SubscribeMessage('gimme')
//   handleGimme(client: Socket) {
//     client.emit('user_states', this.GetUserStates());
//   }

//   @SubscribeMessage('alive')
//   HandleAlive(client: Socket, payload: { userId: string }) {
//     try {
//       // validateInput(Joi.object({
//       //   userId: ID_VALIDATOR
//       // }), payload);
//       // this.aliveUsers.push(payload.userId)
//       // this.server.emit('user_states', this.GetUserStates());
      
//     } catch (error) {
//       console.log("error handlealive: " + JSON.stringify(error))
//     }
//   }
  
//   @SubscribeMessage('user_state_update')
//   UpdateUserState(userId: string) {
//     //   validateInput(Joi.object({
//       //     userId: ID_VALIDATOR.required(),
//       //  }),{userId})
//       console.log ( "update user state called")
//       this.aliveUsers.push(userId)
//       console.log("emmiting user states: " + JSON.stringify(this.GetUserStates()))
//     // this.server.emit('user_states', this.GetUserStates());
//   }

//   handleDisconnect(client: any) {
//     setTimeout(() => {
//       this.aliveUsers = []
//       this.server.emit('who_is_alive')
//     }, 500);
//   }

//   // @SubscribeMessage('logout')
//   // HandleLogout(client: Socket)
//   // {
//   //   setTimeout(() => {
//   //     this.aliveUsers = []
//   //     this.server.emit('who_is_alive')
//   //   }, 500);
//   // }

//   GetUserStates() {
//     // remove duplicates
//     this.aliveUsers = this.aliveUsers.filter((item, index) => this.aliveUsers.indexOf(item) === index)

//     const userStates = new Array()
//     this.aliveUsers.forEach((id: any) => {
//       if (usersInGame.has(id))
//         userStates.push({ userId: id, state: "inGame" })
//       else
//         userStates.push({ userId: id, state: "online" })
//     })
//     return userStates;
//   }
// }

export class StateGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  handleConnection(client: any, ...args: any[]) { }

  // connections = new Array<Connections>();

  @WebSocketServer() server: Server;

  afterInit(server: any) {
    console.log('State Socket initialized')
  }

  aliveUsers = new Array<string>();
  
  @SubscribeMessage('gimme')
  handleGimme(client: Socket) {
    client.emit('user_states', this.GetUserStates());
  }

  @SubscribeMessage('alive')
  HandleAlive(client: Socket, payload: { userId: string }) {
    this.aliveUsers.push(payload.userId)
    this.server.emit('user_states', this.GetUserStates());
  }

  @SubscribeMessage('logout')
  HandleLogout(client: Socket)
  {
    setTimeout(() => {
      this.aliveUsers = []
      this.server.emit('who_is_alive')
    }, 500);
  }

  UpdateUserState(userId: string) {
    console.log ( "update user state called")
    this.aliveUsers.push(userId)
    this.server.emit('user_states', this.GetUserStates());
  }

  handleDisconnect(client: any) {
    setTimeout(() => {
      this.aliveUsers = []
      this.server.emit('who_is_alive')
    }, 500);
  }

  GetUserStates() {
    // remove duplicates
    this.aliveUsers = this.aliveUsers.filter((item, index) => this.aliveUsers.indexOf(item) === index)

    const userStates = new Array()
    this.aliveUsers.forEach((id: any) => {
      if (usersInGame.has(id))
        userStates.push({ userId: id, state: "inGame" })
      else
        userStates.push({ userId: id, state: "online" })
    })
    return userStates;
  }
}
