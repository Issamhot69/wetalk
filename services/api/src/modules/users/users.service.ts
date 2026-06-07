import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    username: string;
    email: string;
    password: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
      },
    });
  }

  async search(query: string) {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        isOnline: true,
      },
      take: 20,
    });
  }

  async updateProfile(id: string, data: {
    username?: string;
    bio?: string;
    avatar?: string;
  }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
      },
    });
  }

  async setOnlineStatus(id: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isOnline,
        lastSeen: new Date(),
      },
    });
  }
}
