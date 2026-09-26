import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { ProvidersService } from '../providers/providers.service';
import { CreateChatSessionDto, SendMessageDto } from './dto/chat.dto';
import axios from 'axios';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private providersService: ProvidersService,
  ) {}

  async createSession(userId: string, dto: CreateChatSessionDto) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        projectId: dto.projectId,
        title: dto.title,
      },
    });
  }

  async getSessions(userId: string) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session || session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return session;
  }

  async sendMessage(sessionId: string, userId: string, dto: SendMessageDto) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session || session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Save user message
    await this.prisma.message.create({
      data: {
        sessionId,
        role: 'user',
        content: dto.content,
      },
    });

    // Get AI provider
    const provider = await this.providersService.getDefaultProvider(userId);
    if (!provider) {
      throw new BadRequestException('No AI provider configured');
    }

    // Build context from project files if available
    let context = '';
    if (session.projectId) {
      const files = await this.prisma.file.findMany({
        where: { projectId: session.projectId },
        take: 10, // Limit to prevent token overflow
      });
      if (files.length > 0) {
        context = `\n\nProject context:\n${files.map(f => `File: ${f.path}\n${f.content.substring(0, 1000)}`).join('\n\n')}`;
      }
    }

    // Get AI response
    const messages = session.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    messages.push({
      role: 'user',
      content: dto.content + context,
    });

    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: provider.modelName,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.apiKey}`,
          },
          timeout: 30000,
        },
      );

      const assistantMessage = response.data.choices?.[0]?.message?.content;
      if (!assistantMessage) {
        throw new Error('No response from AI provider');
      }

      // Save assistant message
      const savedMessage = await this.prisma.message.create({
        data: {
          sessionId,
          role: 'assistant',
          content: assistantMessage,
        },
      });

      return savedMessage;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          `AI provider error: ${error.response?.data?.error?.message || error.message}`,
        );
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to get AI response: ${errorMessage}`);
    }
  }

  async deleteSession(sessionId: string, userId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.chatSession.delete({
      where: { id: sessionId },
    });
  }
}
