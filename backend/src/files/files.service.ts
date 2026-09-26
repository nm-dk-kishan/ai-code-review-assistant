import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as unzipper from 'unzipper';

const ALLOWED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.rs',
  '.go', '.rb', '.php', '.swift', '.kt', '.cs', '.json', '.yaml', '.yml',
  '.xml', '.html', '.css', '.scss', '.sql', '.md', '.txt', '.env',
  '.sh', '.bash', '.dockerfile', '.gradle', '.maven'
];

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB
const DANGEROUS_PATHS = ['.git/', 'node_modules/', '.env', 'secret', 'key'];

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  private isSafePath(filePath: string): boolean {
    const normalized = path.normalize(filePath).replace(/\\/g, '/');
    if (normalized.startsWith('..') || normalized.includes('/..')) {
      return false;
    }
    for (const dangerous of DANGEROUS_PATHS) {
      if (normalized.includes(dangerous)) {
        return false;
      }
    }
    return true;
  }

  private isSafeExtension(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  }

  async uploadZip(projectId: string, userId: string, file: Express.Multer.File) {
    // Verify ownership
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large');
    }

    if (file.mimetype !== 'application/zip' && !file.originalname.endsWith('.zip')) {
      throw new BadRequestException('Invalid file type');
    }

    try {
      // Extract and process files
      const files: any[] = [];
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(file.path)
          .pipe(unzipper.Parse())
          .on('entry', async (entry: any) => {
            const filePath = entry.path;
            const type = entry.type; // 'File' or 'Directory'

            if (type === 'File' && this.isSafePath(filePath) && this.isSafeExtension(filePath)) {
              let content = '';
              try {
                content = await new Promise<string>((resolveRead, rejectRead) => {
                  let data = '';
                  entry.on('data', (chunk: any) => {
                    data += chunk.toString();
                  });
                  entry.on('end', () => resolveRead(data));
                  entry.on('error', rejectRead);
                });

                if (content.length > MAX_FILE_SIZE) {
                  entry.autodrain();
                  return;
                }

                // Create file record
                const fileRecord = await this.prisma.file.create({
                  data: {
                    projectId,
                    path: filePath,
                    content,
                    language: this.detectLanguage(filePath),
                    size: content.length,
                  },
                });

                files.push(fileRecord);
              } catch (err) {
                entry.autodrain();
              }
            } else {
              entry.autodrain();
            }
          })
          .on('error', reject)
          .on('end', resolve);
      });

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      return { success: true, fileCount: files.length, files };
    } catch (error) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Failed to process ZIP file');
    }
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: { [key: string]: string } = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.rs': 'rust',
      '.go': 'go',
      '.rb': 'ruby',
      '.php': 'php',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.cs': 'csharp',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.xml': 'xml',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sql': 'sql',
      '.md': 'markdown',
      '.sh': 'bash',
      '.bash': 'bash',
    };
    return languageMap[ext] || 'plaintext';
  }

  async getProjectFiles(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.file.findMany({
      where: { projectId },
      select: { id: true, path: true, language: true, size: true, createdAt: true },
    });
  }

  async getFile(fileId: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: { project: true },
    });

    if (!file || file.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return file;
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      include: { project: true },
    });

    if (!file || file.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.file.delete({
      where: { id: fileId },
    });
  }
}
