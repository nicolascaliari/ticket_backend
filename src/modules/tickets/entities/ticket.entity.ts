import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketType } from '../enums/ticket-type.enum';

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ _id: true, timestamps: { createdAt: true, updatedAt: false } })
export class TicketAttachment {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  publicId!: string;

  @Prop({ required: true })
  originalName!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  size!: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy!: Types.ObjectId;
}

export const TicketAttachmentSchema =
  SchemaFactory.createForClass(TicketAttachment);

@Schema({ timestamps: true })
export class Ticket {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Project',
  })
  projectId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  })
  reportedId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: false,
    ref: 'User',
  })
  assignedToId!: Types.ObjectId;

  @Prop({
    required: true,
  })
  title!: string;

  @Prop({
    required: true,
  })
  description!: string;

  @Prop({
    required: true,
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status!: TicketStatus;

  @Prop({
    required: true,
    enum: TicketPriority,
    default: TicketPriority.LOW,
  })
  priority!: TicketPriority;

  @Prop({
    required: true,
    enum: TicketType,
    default: TicketType.BUG,
  })
  type!: TicketType;

  @Prop({ type: [TicketAttachmentSchema], default: [] })
  attachments!: TicketAttachment[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
