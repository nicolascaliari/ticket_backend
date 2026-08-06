import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {

    @Prop({
        required: true,
        unique: true,
        index: true,
    })
    name!: string;

    @Prop({
        required: true,
        index: true,
    })
    description!: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clients',
        required: true,
        index: true,
    })
    clientId!: Types.ObjectId;

}

export const ProjectSchema = SchemaFactory.createForClass(Project);