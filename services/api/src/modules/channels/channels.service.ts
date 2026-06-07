import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ChannelsService {
  constructor(private prisma: PrismaService) {}

  async createDirect(userId: string, targetId: string) {
    const existing = await this.prisma.channel.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          every: { userId: { in: [userId, targetId] } },
        },
      },
    });
    if (existing) return existing;

    return this.prisma.channel.create({
      data: {
        type: 'DIRECT',
        members: {
          create: [
            { userId, role: 'MEMBER' },
            { userId: targetId, role: 'MEMBER' },
          ],
        },
      },
      include: { members: { include: { user: { select: { id: true, username: true, avatar: true } } } } },
    });
  }

  async createGroup(data: {
    name: string;
    description?: string;
    memberIds: string[];
    ownerId: string;
  }) {
    return this.prisma.channel.create({
      data: {
        name: data.name,
        description: data.description,
        type: 'GROUP',
        members: {
          create: [
            { userId: data.ownerId, role: 'OWNER' },
            ...data.memberIds.map((id) => ({ userId: id, role: 'MEMBER' as any })),
          ],
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, avatar: true } } },
        },
      },
    });
  }

  async getUserChannels(userId: string) {
    return this.prisma.channel.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, avatar: true, isOnline: true } } },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { username: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getChannel(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, avatar: true, isOnline: true } } },
        },
      },
    });

    if (!channel) throw new NotFoundException('Channel introuvable');

    const isMember = channel.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Accès refusé');

    return channel;
  }

  async addMember(channelId: string, userId: string, targetId: string) {
    const member = await this.prisma.channelMember.findFirst({
      where: { channelId, userId },
    });
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new ForbiddenException('Droits insuffisants');
    }

    return this.prisma.channelMember.create({
      data: { channelId, userId: targetId, role: 'MEMBER' },
    });
  }

  async leave(channelId: string, userId: string) {
    return this.prisma.channelMember.delete({
      where: { userId_channelId: { userId, channelId } },
    });
  }
}
