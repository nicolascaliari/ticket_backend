import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";



export type ClientDocument = HydratedDocument<Client>;

@Schema({ timestamps: true })
export class Client {
    @Prop({
        required: true,
    })
    name!: string;


    @Prop({
        required: true,
    })
    email !: string
}



export const ClientSchema = SchemaFactory.createForClass(Client)