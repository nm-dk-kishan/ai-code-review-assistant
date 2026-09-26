import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAIProviderDto, UpdateAIProviderDto } from './dto/provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async createProvider(userId: string, dto: CreateAIProviderDto) {
    return this.prisma.aIProvider.create({
      data: {
        userId,
        name: dto.name,
        baseUrl: dto.baseUrl,
        apiKey: dto.apiKey,
        modelName: dto.modelName,
      },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        modelName: true,
        isDefault: true,
        createdAt: true,
      },
    });
  }

  async getProviders(userId: string) {
    return this.prisma.aIProvider.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        modelName: true,
        isDefault: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProvider(providerId: string, userId: string) {
    const provider = await this.prisma.aIProvider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        modelName: true,
        isDefault: true,
        userId: true,
        createdAt: true,
      },
    });

    if (!provider || provider.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return provider;
  }

  async updateProvider(providerId: string, userId: string, dto: UpdateAIProviderDto) {
    const provider = await this.prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || provider.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.aIProvider.update({
      where: { id: providerId },
      data: dto,
      select: {
        id: true,
        name: true,
        baseUrl: true,
        modelName: true,
        isDefault: true,
        createdAt: true,
      },
    });
  }

  async setDefaultProvider(providerId: string, userId: string) {
    const provider = await this.prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || provider.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Unset other defaults
    await this.prisma.aIProvider.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    return this.prisma.aIProvider.update({
      where: { id: providerId },
      data: { isDefault: true },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        modelName: true,
        isDefault: true,
      },
    });
  }

  async deleteProvider(providerId: string, userId: string) {
    const provider = await this.prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || provider.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.aIProvider.delete({
      where: { id: providerId },
    });
  }

  async getDefaultProvider(userId: string) {
    let provider = await this.prisma.aIProvider.findFirst({
      where: { userId, isDefault: true },
      select: {
        id: true,
        name: true,
        baseUrl: true,
        apiKey: true,
        modelName: true,
      },
    });

    if (!provider) {
      provider = await this.prisma.aIProvider.findFirst({
        where: { userId },
        select: {
          id: true,
          name: true,
          baseUrl: true,
          apiKey: true,
          modelName: true,
        },
      });
    }

    return provider;
  }

  async getProviderWithApiKey(providerId: string, userId: string) {
    const provider = await this.prisma.aIProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider || provider.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return provider;
  }
}
