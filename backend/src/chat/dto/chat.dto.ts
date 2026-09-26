import { IsString, IsOptional } from 'class-validator';

export class CreateChatSessionDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  projectId?: string;
}

export class SendMessageDto {
  @IsString()
  content: string;
}
