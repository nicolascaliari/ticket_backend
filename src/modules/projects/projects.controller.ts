import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    role: string;
    clientId?: string;
  };
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Auth(Roles.Client)
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: RequestWithUser,
  ) {
    const clientId = req.user.clientId ?? (createProjectDto.clientId as unknown as string);
    if (!clientId) {
      throw new BadRequestException('Client ID is required to create a project');
    }
    return this.projectsService.create({
      ...createProjectDto,
      clientId: clientId as any,
    });
  }

  @Get()
  @Auth(Roles.Client)
  findAll(
    @Query('clientId') clientId: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    const scopedClientId = req.user.clientId ?? clientId;
    return this.projectsService.findAll(scopedClientId);
  }

  @Get(':id')
  @Auth(Roles.Client)
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Auth(Roles.Admin)
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  @Auth(Roles.Admin)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
