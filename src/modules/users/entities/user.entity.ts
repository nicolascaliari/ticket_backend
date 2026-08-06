import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Roles } from '../../../common/enums/roles.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, required: true })
  username!: string;

  @Prop({ unique: true, required: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({
    default: Roles.Client,
    enum: Roles,
    type: String,
  })
  role!: Roles;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ default: 0 })
  tokenVersion!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clients',
  })
  clientId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
