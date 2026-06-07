import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ChatGateway } from '../realtime/chat.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private chatGateway: ChatGateway,
  ) {}

  async send(data: {
    content: string;
    channelId: string;
    senderId: string;
    replyToId?: string;
    type?: string;
  }) {
    const message = await this.prisma.message.create({
      data: {
        content: data.content,
        channelId: data.channelId,
        senderId: data.senderId,
        replyToId: data.replyToId,
        type: (data.type as any) ?? 'TEXT',
      },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        replyTo: { include: { sender: { select: { id: true, username: true } } } },
        reactions: true,
        media: true,
      },
    });

    // Emit en temps réel
    this.chatGateway.emitToChannel(data.channelId, 'message:new', message);

    return message;
  }

  async getChannelMessages(channelId: string, cursor?: string, limit = 30) {
    const messages = await this.prisma.message.findMany({
      where: { channelId, isDeleted: false },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        reactions: true,
        media: true,
        replyTo: { include: { sender: { select: { id: true, username: true } } } },
      },
    });

    return {
      messages: messages.reverse(),
      nextCursor: messages.length === limit ? messages[0].id : null,
    };
  }

  async edit(messageId: string, userId: string, content: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message introuvable');
    if (message.senderId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { content, isEdited: true },
    });

    this.chatGateway.emitToChannel(message.channelId, 'message:edited', updated);
    return updated;
  }

  async delete(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message introuvable');
    if (message.senderId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true, content: null },
    });

    this.chatGateway.emitToChannel(message.channelId, 'message:deleted', { id: messageId });
    return updated;
  }

  async addReaction(messageId: string, userId: string, emoji: string) {
    const reaction = await this.prisma.reaction.upsert({
      where: { userId_messageId_emoji: { userId, messageId, emoji } },
      create: { userId, messageId, emoji },
      update: {},
    });

    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (message) this.chatGateway.emitToChannel(message.channelId, 'message:reaction', { messageId, emoji, userId });

    return reaction;
  }

  async removeReaction(messageId: string, userId: string, emoji: string) {
    return this.prisma.reaction.delete({
      where: { userId_messageId_emoji: { userId, messageId, emoji } },
    });
  }
}
