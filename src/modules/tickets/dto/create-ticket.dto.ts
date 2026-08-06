import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketType } from '../enums/ticket-type.enum';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsMongoId()
  projectId!: string;

  @IsOptional()
  @IsMongoId()
  reportedId?: string;

  @IsOptional()
  @IsMongoId()
  assignedToId?: string;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsNotEmpty()
  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @IsNotEmpty()
  @IsEnum(TicketType)
  type!: TicketType;
}
