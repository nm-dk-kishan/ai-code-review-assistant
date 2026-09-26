import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, SendMessageDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('sessions')
  async createSession(@Body() dto: CreateChatSessionDto, @Request() req: any) {
    return this.chatService.createSession(req.user.id, dto);
  }

  @Get('sessions')
  async getSessions(@Request() req: any) {
    return this.chatService.getSessions(req.user.id);
  }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string, @Request() req: any) {
    return this.chatService.getSession(id, req.user.id);
  }

  @Post('sessions/:id/messages')
  async sendMessage(@Param('id') id: string, @Body() dto: SendMessageDto, @Request() req: any) {
    return this.chatService.sendMessage(id, req.user.id, dto);
  }

  @Delete('sessions/:id')
  async deleteSession(@Param('id') id: string, @Request() req: any) {
    return this.chatService.deleteSession(id, req.user.id);
  }
}
