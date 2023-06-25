
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
import { ConnectionIsNotSetError } from 'typeorm';

@WebSocketGateway(84, {
  cors: { origin: '*' },
})


export class StateGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  handleConnection(client: any, ...args: any[]) { }

  connections = new Array<Connections>();

  @WebSocketServer() server: Server;

  afterInit(server: any) {
    console.log('State Socket initialized')
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected from state socket')
    const userId = this.connections.find((item: any) => item.clientId === client.id)?.userId
    if (!userId)
      return;

    const msg = { userId: userId, state: "offline" }
    client.broadcast.emit('user_state_updated', msg);
    console.log("user state updated from handleDisconnect")
    console.log(msg)

    this.connections = this.connections.filter((item: any) => item.clientId !== client.id)
  }

  @SubscribeMessage('get_users_states')
  handleGetUsersStates(client: Socket) {
    const array = Array.from(this.connections)
    const msg = array.map((item: any) => {
      return { userId: item.userId, state: usersInGame.has(item.userId) ? "inGame" : "online" }
    })
    client.emit('user_states', msg);

  }

  @SubscribeMessage('user_state_updated')
  HandleUserUpdate(client: Socket, payload: { userId: string }) {
    this.connections = this.connections.filter((item: any) => item.clientId !== client.id)
    this.connections.push({ clientId: client.id, userId: payload.userId })
    var msg;
    if (usersInGame.has(payload.userId))
      msg = { userId: payload.userId, state: "inGame" }
    else
      msg = { userId: payload.userId, state: "online" }

    client.broadcast.emit('user_state_updated', msg);

    console.log("user state updated from login")
    console.log(msg)
  }

  @SubscribeMessage('user_logout')
  HandleUserLogout(client: Socket, payload: { userId: string }) {
    this.connections = this.connections.filter((item: any) => item.clientId !== client.id)
    this.connections.push({ clientId: client.id, userId: payload.userId })
    console.log('Client logout from state socket')
    const msg = { userId: payload.userId, state: "offline" }
    client.broadcast.emit('user_state_updated', msg);
    console.log("user state updated from logout")
  }

  UpdateGameState(userId: string, state: string) {
    //if there is no connection for this user, we don't need to update the state
    if (!this.connections.find((item: any) => item.userId === userId))
      return;
      
    const msg = { userId: userId, state: state }
    this.server.emit('user_state_updated', msg);

    console.log("user state updated from game")
    console.log(msg)
  }
}

interface Connections {
  clientId: string;
  userId: string;
}