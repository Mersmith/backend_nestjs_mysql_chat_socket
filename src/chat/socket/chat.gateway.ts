import { UnauthorizedException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/service/auth.service';
import { UserI } from 'src/user/model/user.inteface';
import { UserService } from 'src/user/service/user-service/user.service';
import { RoomService } from '../service/room-service/room.service';
import { RoomI } from '../model/room.interface';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4200']
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  title: string[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roomService: RoomService
  ) { }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
      const user: UserI = await this.userService.getOne(decodedToken.user.id);

      if (!user) {
        return this.disconnect(socket)
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });

        return this.server.to(socket.id).emit('rooms', rooms);
        //this.title.push('Value ' + Math.random().toString());
        //this.server.emit('message', this.title);
      }
    } catch {
      return this.disconnect(socket)
    }
    //console.log('On Connect');
    //this.server.emit('message', 'handleConnection');//enviado al frontend
  }

  handleDisconnect(socket: Socket) {
    console.log('On Disconnect');
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI): Promise<RoomI> {

    console.log(socket.data.user);
    console.log(socket.data.user.id);
    console.log(room.users);
    return this.roomService.createRoom(room, socket.data.user);
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

}
