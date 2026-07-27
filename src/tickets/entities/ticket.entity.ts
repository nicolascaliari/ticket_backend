import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { TicketStatus } from "../enums/ticket-status.enum";
import { TicketPriority } from "../enums/ticket-priority.enum";
import { TicketType } from "../enums/ticket-type.enum";


export type TicketDocument = HydratedDocument<Ticket>;


@Schema({ timestamps: true })
export class Ticket {


    @Prop({
        required: true,
        ref: 'Project',
    })
    projectId!: Types.ObjectId;


    @Prop({
        required: true,
        ref: 'User',
    })
    reportedId!: Types.ObjectId;

    @Prop({
        required: false,
        ref: 'User',
    })
    assignedToId!: Types.ObjectId;

    @Prop({
        required: true,
    })
    title!: string

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
}


export const TicketSchema = SchemaFactory.createForClass(Ticket)
