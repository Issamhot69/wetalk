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
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  async handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.broadcast.emit('user:online', { userId });
      console.log(`✅ User ${userId} connecté`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()]
      .find(([, socketId]) => socketId === client.id)?.[0];

    if (userId) {
      this.connectedUsers.delete(userId);
      client.broadcast.emit('user:offline', { userId });
      console.log(`❌ User ${userId} déconnecté`);
    }
  }

  @SubscribeMessage('channel:join')
  handleJoinChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.channelId);
    console.log(`User rejoint channel ${data.channelId}`);
  }

  @SubscribeMessage('channel:leave')
  handleLeaveChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.channelId);
  }

  @SubscribeMessage('message:send')
  handleMessage(
    @MessageBody() data: { channelId: string; message: any },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.channelId).emit('message:new', data.message);
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { channelId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.channelId).emit('typing:start', { userId: data.userId });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { channelId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.channelId).emit('typing:stop', { userId: data.userId });
  }

  // Méthode publique pour émettre depuis les services
  emitToChannel(channelId: string, event: string, data: any) {
    this.server.to(channelId).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
