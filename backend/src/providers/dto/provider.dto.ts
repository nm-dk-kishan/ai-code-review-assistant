import { IsString, IsUrl } from 'class-validator';

export class CreateAIProviderDto {
  @IsString()
  name: string; // "openai", "lm-studio", "custom"

  @IsUrl()
  baseUrl: string;

  @IsString()
  apiKey: string;

  @IsString()
  modelName: string;
}

export class UpdateAIProviderDto {
  @IsString()
  name?: string;

  @IsUrl()
  baseUrl?: string;

  @IsString()
  apiKey?: string;

  @IsString()
  modelName?: string;
}
