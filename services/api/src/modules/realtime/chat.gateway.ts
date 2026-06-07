import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users = new Map<string, string>();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      this.users.set(userId, client.id);
      client.broadcast.emit('user:online', { userId });
      console.log(`✅ ${userId} connecté`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.users.entries()]
      .find(([, sid]) => sid === client.id)?.[0];
    if (userId) {
      this.users.delete(userId);
      client.broadcast.emit('user:offline', { userId });
      console.log(`❌ ${userId} déconnecté`);
    }
  }

  @SubscribeMessage('channel:join')
  joinChannel(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.channelId);
  }

  @SubscribeMessage('channel:leave')
  leaveChannel(@MessageBody() data: { channelId: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.channelId);
  }

  @SubscribeMessage('typing:start')
  typingStart(@MessageBody() data: { channelId: string; userId: string }, @ConnectedSocket() client: Socket) {
    client.to(data.channelId).emit('typing:start', { userId: data.userId });
  }

  @SubscribeMessage('typing:stop')
  typingStop(@MessageBody() data: { channelId: string; userId: string }, @ConnectedSocket() client: Socket) {
    client.to(data.channelId).emit('typing:stop', { userId: data.userId });
  }

  emitToChannel(channelId: string, event: string, data: any) {
    this.server.to(channelId).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    const sid = this.users.get(userId);
    if (sid) this.server.to(sid).emit(event, data);
  }
}
