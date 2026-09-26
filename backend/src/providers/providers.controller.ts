import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProvidersService } from './providers.service';
import { CreateAIProviderDto, UpdateAIProviderDto } from './dto/provider.dto';

@Controller('providers')
@UseGuards(AuthGuard('jwt'))
export class ProvidersController {
  constructor(private providersService: ProvidersService) {}

  @Post()
  async create(@Body() dto: CreateAIProviderDto, @Request() req: any) {
    return this.providersService.createProvider(req.user.id, dto);
  }

  @Get()
  async getAll(@Request() req: any) {
    return this.providersService.getProviders(req.user.id);
  }

  @Get('default')
  async getDefault(@Request() req: any) {
    return this.providersService.getDefaultProvider(req.user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.providersService.getProvider(id, req.user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAIProviderDto, @Request() req: any) {
    return this.providersService.updateProvider(id, req.user.id, dto);
  }

  @Post(':id/set-default')
  async setDefault(@Param('id') id: string, @Request() req: any) {
    return this.providersService.setDefaultProvider(id, req.user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.providersService.deleteProvider(id, req.user.id);
  }
}
