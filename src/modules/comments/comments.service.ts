import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, CommentDocument } from './entities/comment.entity';
import { User, UserDocument } from '../users/entities/user.entity';
import { Ticket, TicketDocument } from '../tickets/entities/ticket.entity';
import { Project, ProjectDocument } from '../projects/entities/project.entity';

export interface AuthUserPayload {
  sub: string;
  email: string;
  role: string;
  clientId?: string;
  permissions?: string[];
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  private isStaff(user: AuthUserPayload) {
    return !user.clientId;
  }

  private async assertTicketAccess(
    ticket: TicketDocument,
    user: AuthUserPayload,
  ) {
    if (this.isStaff(user)) return;

    if (!user.clientId) {
      throw new ForbiddenException('No tenés acceso a este ticket');
    }

    const project = await this.projectModel.findById(ticket.projectId);
    if (!project || project.clientId.toString() !== user.clientId) {
      throw new ForbiddenException('No tenés acceso a este ticket');
    }
  }

  private async getAccessibleTicket(ticketId: string, user: AuthUserPayload) {
    const ticket = await this.ticketModel.findById(ticketId);
    if (!ticket || ticket.deletedAt) {
      throw new NotFoundException('Ticket not found');
    }
    await this.assertTicketAccess(ticket, user);
    return ticket;
  }

  private async serializeComments(comments: CommentDocument[]) {
    const userIds = [
      ...new Set(comments.map((comment) => comment.userId.toString())),
    ];

    const users =
      userIds.length > 0
        ? await this.userModel
            .find({ _id: { $in: userIds } })
            .select('name lastName role email')
        : [];

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    return comments.map((comment) => {
      const author = userMap.get(comment.userId.toString());
      const plain = comment.toObject({ virtuals: false }) as CommentDocument & {
        createdAt?: Date;
        updatedAt?: Date;
      };

      return {
        _id: comment._id.toString(),
        ticketId: comment.ticketId.toString(),
        userId: comment.userId.toString(),
        content: plain.content,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        author: author
          ? {
              _id: author._id.toString(),
              name: author.name,
              lastName: author.lastName,
              role: author.role,
              email: author.email,
            }
          : undefined,
      };
    });
  }

  async create(
    ticketId: string,
    createCommentDto: CreateCommentDto,
    user: AuthUserPayload,
  ) {
    await this.getAccessibleTicket(ticketId, user);

    const comment = await this.commentModel.create({
      ticketId: new Types.ObjectId(ticketId),
      userId: new Types.ObjectId(user.sub),
      content: createCommentDto.content.trim(),
    });

    const [serialized] = await this.serializeComments([comment]);
    return serialized;
  }

  async findByTicket(ticketId: string, user: AuthUserPayload) {
    await this.getAccessibleTicket(ticketId, user);

    const comments = await this.commentModel
      .find({ ticketId: new Types.ObjectId(ticketId) })
      .sort({ createdAt: 1 });

    return this.serializeComments(comments);
  }
}
