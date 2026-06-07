import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { AiModule } from './modules/ai/ai.module';
import { PrismaModule } from './common/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    MessagesModule,
    ChannelsModule,
    AiModule,
  ],
})
export class AppModule {}
