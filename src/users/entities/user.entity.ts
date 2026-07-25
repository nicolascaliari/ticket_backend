import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, ObjectId, Types } from "mongoose";
import { UserRole } from "../enum/user.enum";


export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

    @Prop({
        unique: true,
        required: true,
    })
    username!: string;



    @Prop({
        unique: true,
        required: true,
    })
    email!: string;


    @Prop({
        required: true,
    })
    password!: string;


    @Prop({
        default: [UserRole.USER],
        enum: UserRole,
        type: [String],
    })
    roles!: UserRole[];


    //object id mongo

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',
    })
    clientId! : Types.ObjectId
}


export const UserSchema = SchemaFactory.createForClass(User)