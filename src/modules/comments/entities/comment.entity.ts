import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'Ticket',
  })
  ticketId!: Types.ObjectId;

  @Prop({
    required: true,
  })
  content!: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
