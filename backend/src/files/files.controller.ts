import { Controller, Post, Get, Delete, Param, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import * as path from 'path';

@Controller('files')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload/:projectId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const uploadDir = process.env.UPLOAD_DIR || './uploads';
          if (!require('fs').existsSync(uploadDir)) {
            require('fs').mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        },
      }),
    }),
  )
  async uploadZip(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.filesService.uploadZip(projectId, req.user.id, file);
  }

  @Get('project/:projectId')
  async getProjectFiles(@Param('projectId') projectId: string, @Request() req: any) {
    return this.filesService.getProjectFiles(projectId, req.user.id);
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Request() req: any) {
    return this.filesService.getFile(id, req.user.id);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string, @Request() req: any) {
    return this.filesService.deleteFile(id, req.user.id);
  }
}
