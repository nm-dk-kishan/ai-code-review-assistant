import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AIModule } from '../ai/ai.module';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [PrismaModule, AIModule, ProvidersModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
