import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: { username: string; email: string; password: string }) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      ...dto,
      password: hashed,
    });

    const token = this.generateToken(user.id, user.email);
    return { user: this.sanitize(user), token };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const token = this.generateToken(user.id, user.email);
    return { user: this.sanitize(user), token };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  private generateToken(userId: string, email: string) {
    return this.jwtService.sign({ sub: userId, email });
  }

  private sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
