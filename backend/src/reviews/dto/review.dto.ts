import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  projectId: string;

  @IsArray()
  fileIds: string[];

  @IsString()
  mode: 'security' | 'performance' | 'quality';
}

export class ReviewQueryDto {
  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
