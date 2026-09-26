import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { ProvidersService } from '../providers/providers.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private providersService: ProvidersService,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    // Verify project ownership
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project || project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Verify files exist and belong to project
    const files = await this.prisma.file.findMany({
      where: {
        id: { in: dto.fileIds },
        projectId: dto.projectId,
      },
    });

    if (files.length === 0) {
      throw new BadRequestException('No valid files found');
    }

    // Get AI provider
    const provider = await this.providersService.getDefaultProvider(userId);
    if (!provider) {
      throw new BadRequestException('No AI provider configured');
    }

    // Combine code from all files
    const combinedCode = files.map(f => `// File: ${f.path}\n${f.content}`).join('\n\n');

    // Get AI review
    const aiReview = await this.aiService.reviewCode(combinedCode, dto.mode as any, provider);

    // Save review
    const review = await this.prisma.review.create({
      data: {
        userId,
        projectId: dto.projectId,
        fileIds: dto.fileIds,
        mode: dto.mode,
        summary: aiReview.summary,
        issues: aiReview.issues,
        recommendations: aiReview.recommendations,
      },
      include: {
        project: { select: { name: true } },
      },
    });

    return review;
  }

  async getReviews(userId: string, projectId?: string) {
    const where: any = { userId };
    if (projectId) {
      // Verify ownership
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project || project.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }
      where.projectId = projectId;
    }

    return this.prisma.review.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReviewById(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    if (!review || review.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return review;
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
