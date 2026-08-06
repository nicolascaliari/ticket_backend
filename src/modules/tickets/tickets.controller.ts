import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { TicketsService, AuthUserPayload } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

interface RequestWithUser extends Request {
  user: AuthUserPayload;
}

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Auth(Roles.Client)
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() req: RequestWithUser,
  ) {
    return this.ticketsService.create(createTicketDto, req.user);
  }

  @Get()
  @Auth(Roles.Client)
  findAll(@Query() filters: FilterTicketsDto, @Req() req: RequestWithUser) {
    return this.ticketsService.findAll(filters, req.user);
  }

  @Get(':id')
  @Auth(Roles.Client)
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.ticketsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Auth(Roles.Client)
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() req: RequestWithUser,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user);
  }

  @Post(':id/attachments')
  @Auth(Roles.Client)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  addAttachment(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Campo "file" requerido (multipart/form-data)',
      );
    }
    return this.ticketsService.addAttachment(id, file, req.user);
  }

  @Delete(':id/attachments/:attachmentId')
  @Auth(Roles.Client)
  removeAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.ticketsService.removeAttachment(id, attachmentId, req.user);
  }

  @Delete(':id')
  @Auth(Roles.Admin)
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
