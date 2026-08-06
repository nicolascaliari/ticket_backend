import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './entities/project.entity';
import { Client, ClientDocument } from '../clients/entities/client.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const clientId = new Types.ObjectId(createProjectDto.clientId);
    const client = await this.clientModel.findById(clientId);
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const project = await this.projectModel.create({
      ...createProjectDto,
      clientId,
    });
    if (!project) {
      throw new InternalServerErrorException('Failed to create project');
    }

    return project;
  }

  findAll(clientId?: string) {
    const query = clientId && isValidObjectId(clientId)
      ? { clientId: new Types.ObjectId(clientId) }
      : clientId
      ? { clientId }
      : {};
    return this.projectModel.find(query).sort({ createdAt: -1 });
  }

  findOne(id: string) {
    return this.projectModel.findById(id);
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
