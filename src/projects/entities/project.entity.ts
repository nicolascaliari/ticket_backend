import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

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
        unique: true,
        index: true,
    })
    description!: string;

    @Prop({
        required: true,
        unique: true,
        index: true,
    })
    clientId!: Types.ObjectId;

}



export const ProjectSchema = SchemaFactory.createForClass(Project)