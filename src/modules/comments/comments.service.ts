import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './entities/comment.entity';
import { User, UserDocument } from '../users/entities/user.entity';
import { Ticket, TicketDocument } from '../tickets/entities/ticket.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const user = await this.userModel.findById(createCommentDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ticket = await this.ticketModel.findById(createCommentDto.ticketId);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const comment = await this.commentModel.create(createCommentDto);
    if (!comment) {
      throw new InternalServerErrorException('Failed to create comment');
    }

    return comment;
  }

  findAll() {
    return this.commentModel.find().sort({ createdAt: -1 });
  }

  findOne(id: string) {
    return this.commentModel.findById(id);
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
