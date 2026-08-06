import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Project, ProjectDocument } from '../projects/entities/project.entity';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { Ticket, TicketDocument } from './entities/ticket.entity';
import { TicketStatus } from './enums/ticket-status.enum';
import { StorageService } from '../storage/storage.service';

export interface AuthUserPayload {
  sub: string;
  email: string;
  role: string;
  clientId?: string;
  permissions?: string[];
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    private readonly storageService: StorageService,
  ) {}

  private isStaff(user: AuthUserPayload) {
    return !user.clientId;
  }

  private async getProjectIdsForClient(clientId: string) {
    const projects = await this.projectModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .select('_id');
    return projects.map((project) => project._id);
  }

  private async assertTicketAccess(ticket: TicketDocument, user: AuthUserPayload) {
    if (this.isStaff(user)) return;

    if (!user.clientId) {
      throw new ForbiddenException('No tenés acceso a este ticket');
    }

    const project = await this.projectModel.findById(ticket.projectId);
    if (!project || project.clientId.toString() !== user.clientId) {
      throw new ForbiddenException('No tenés acceso a este ticket');
    }
  }

  private async assertProjectAccess(projectId: string, user: AuthUserPayload) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    if (!this.isStaff(user)) {
      if (!user.clientId) {
        throw new ForbiddenException('Usuario cliente sin clientId');
      }
      if (project.clientId.toString() !== user.clientId) {
        throw new ForbiddenException('El proyecto no pertenece a tu cliente');
      }
    }

    return project;
  }

  private async serializeTickets(tickets: TicketDocument[]) {
    const assigneeIds = [
      ...new Set(
        tickets
          .map((ticket) => ticket.assignedToId?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const assignees =
      assigneeIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: assigneeIds } })
            .select('name lastName email')
        : [];

    const assigneeMap = new Map(
      assignees.map((user) => [user._id.toString(), user]),
    );

    return tickets.map((ticket) => {
      const assignee = ticket.assignedToId
        ? assigneeMap.get(ticket.assignedToId.toString())
        : undefined;
      const plain = ticket.toObject();

      return {
        ...plain,
        _id: ticket._id.toString(),
        projectId: ticket.projectId.toString(),
        reportedId: ticket.reportedId.toString(),
        assignedToId: ticket.assignedToId?.toString(),
        attachments: (plain.attachments ?? []).map((attachment) => ({
          ...attachment,
          _id: attachment._id?.toString(),
          uploadedBy: attachment.uploadedBy?.toString(),
        })),
        assignedTo: assignee
          ? {
              _id: assignee._id.toString(),
              name: assignee.name,
              lastName: assignee.lastName,
              email: assignee.email,
            }
          : undefined,
      };
    });
  }

  private async serializeTicket(ticket: TicketDocument) {
    const [serialized] = await this.serializeTickets([ticket]);
    return serialized;
  }

  async create(createTicketDto: CreateTicketDto, user: AuthUserPayload) {
    const project = await this.assertProjectAccess(
      createTicketDto.projectId,
      user,
    );

    const reportedId = createTicketDto.reportedId ?? user.sub;
    const reporter = await this.userModel.findById(reportedId);
    if (!reporter) throw new NotFoundException('User not found');

    const ticket = await this.ticketModel.create({
      ...createTicketDto,
      projectId: new Types.ObjectId(project._id),
      reportedId: new Types.ObjectId(reportedId),
      assignedToId: createTicketDto.assignedToId
        ? new Types.ObjectId(createTicketDto.assignedToId)
        : undefined,
      status: createTicketDto.status ?? TicketStatus.OPEN,
    });

    if (!ticket) {
      throw new InternalServerErrorException('Failed to create ticket');
    }

    return this.serializeTicket(ticket);
  }

  private assertNotDeleted(ticket: TicketDocument) {
    if (ticket.deletedAt) {
      throw new NotFoundException('Ticket not found');
    }
  }

  async findAll(filters: FilterTicketsDto = {}, user?: AuthUserPayload) {
    const query: Record<string, unknown> = {
      deletedAt: null,
    };
    let clientId = filters.clientId;

    if (user && !this.isStaff(user)) {
      if (!user.clientId) {
        return [];
      }
      clientId = user.clientId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.search?.trim()) {
      const escaped = filters.search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = {
        $regex: escaped,
        $options: 'i',
      };
    }

    if (filters.projectId) {
      if (user) {
        await this.assertProjectAccess(filters.projectId, user);
      }
      const project = await this.projectModel.findById(filters.projectId);
      if (!project) {
        return [];
      }
      if (clientId && project.clientId.toString() !== clientId) {
        return [];
      }
      query.projectId = new Types.ObjectId(filters.projectId);
    } else if (clientId) {
      const projectIds = await this.getProjectIdsForClient(clientId);
      if (projectIds.length === 0) {
        return [];
      }
      query.projectId = { $in: projectIds };
    }

    if (filters.createdFrom || filters.createdTo) {
      const createdAt: Record<string, Date> = {};

      if (filters.createdFrom) {
        const from = new Date(filters.createdFrom);
        from.setUTCHours(0, 0, 0, 0);
        createdAt.$gte = from;
      }

      if (filters.createdTo) {
        const to = new Date(filters.createdTo);
        to.setUTCHours(23, 59, 59, 999);
        createdAt.$lte = to;
      }

      query.createdAt = createdAt;
    }

    const tickets = await this.ticketModel.find(query).sort({ createdAt: -1 });
    return this.serializeTickets(tickets);
  }

  async findOne(id: string, user: AuthUserPayload) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.assertNotDeleted(ticket);
    await this.assertTicketAccess(ticket, user);
    return this.serializeTicket(ticket);
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, user: AuthUserPayload) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.assertNotDeleted(ticket);
    await this.assertTicketAccess(ticket, user);

    if (updateTicketDto.projectId !== undefined) {
      const project = await this.assertProjectAccess(
        updateTicketDto.projectId,
        user,
      );
      ticket.projectId = new Types.ObjectId(project._id);
    }

    if (updateTicketDto.title !== undefined) {
      ticket.title = updateTicketDto.title;
    }

    if (updateTicketDto.description !== undefined) {
      ticket.description = updateTicketDto.description;
    }

    if (updateTicketDto.status !== undefined) {
      ticket.status = updateTicketDto.status;
    }

    if (updateTicketDto.priority !== undefined) {
      ticket.priority = updateTicketDto.priority;
    }

    if (updateTicketDto.type !== undefined) {
      ticket.type = updateTicketDto.type;
    }

    if (updateTicketDto.assignedToId !== undefined) {
      if (!updateTicketDto.assignedToId) {
        ticket.set('assignedToId', undefined);
      } else {
        const assignee = await this.userModel.findById(
          updateTicketDto.assignedToId,
        );
        if (!assignee) throw new NotFoundException('Assignee not found');
        ticket.assignedToId = new Types.ObjectId(updateTicketDto.assignedToId);
      }
    }

    await ticket.save();
    return this.serializeTicket(ticket);
  }

  async addAttachment(
    id: string,
    file: Express.Multer.File,
    user: AuthUserPayload,
  ) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.assertNotDeleted(ticket);
    await this.assertTicketAccess(ticket, user);

    const uploaded = await this.storageService.uploadImage(file, 'tickets');

    ticket.attachments.push({
      url: uploaded.url,
      publicId: uploaded.publicId,
      originalName: uploaded.originalName,
      mimeType: uploaded.mimeType,
      size: uploaded.size,
      uploadedBy: new Types.ObjectId(user.sub),
    });

    await ticket.save();
    return this.serializeTicket(ticket);
  }

  async removeAttachment(
    id: string,
    attachmentId: string,
    user: AuthUserPayload,
  ) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.assertNotDeleted(ticket);
    await this.assertTicketAccess(ticket, user);

    const attachment = ticket.attachments.find(
      (item) => item._id?.toString() === attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    await this.storageService.deleteFile(attachment.publicId);
    ticket.attachments = ticket.attachments.filter(
      (item) => item._id?.toString() !== attachmentId,
    );
    await ticket.save();

    return this.serializeTicket(ticket);
  }

  async softDelete(id: string, user: AuthUserPayload) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    this.assertNotDeleted(ticket);
    await this.assertTicketAccess(ticket, user);

    ticket.deletedAt = new Date();
    await ticket.save();

    return { ok: true, _id: ticket._id.toString() };
  }
}
