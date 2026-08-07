import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CommentsService, AuthUserPayload } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

interface RequestWithUser extends Request {
  user: AuthUserPayload;
}

@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @Auth(Roles.Client)
  findByTicket(
    @Param('ticketId') ticketId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.findByTicket(ticketId, req.user);
  }

  @Post()
  @Auth(Roles.Client)
  create(
    @Param('ticketId') ticketId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.commentsService.create(ticketId, createCommentDto, req.user);
  }
}
