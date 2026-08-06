import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  userId!: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  ticketId!: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
