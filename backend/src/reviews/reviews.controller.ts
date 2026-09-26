import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReviewQueryDto } from './dto/review.dto';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() dto: CreateReviewDto, @Request() req: any) {
    return this.reviewsService.createReview(req.user.id, dto);
  }

  @Get()
  async getAll(@Query() query: ReviewQueryDto, @Request() req: any) {
    return this.reviewsService.getReviews(req.user.id, query.search);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.getReviewById(id, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.reviewsService.deleteReview(id, req.user.id);
  }
}
