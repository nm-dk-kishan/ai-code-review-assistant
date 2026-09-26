import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @Request() req: any) {
    return this.projectsService.createProject(req.user.id, dto);
  }

  @Get()
  async getAll(@Request() req: any) {
    return this.projectsService.getProjects(req.user.id);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.getProjectById(id, req.user.id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Request() req: any) {
    return this.projectsService.updateProject(id, req.user.id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.deleteProject(id, req.user.id);
  }
}
