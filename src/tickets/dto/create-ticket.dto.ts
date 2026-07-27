import { IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { TicketPriority } from "../enums/ticket-priority.enum";
import { TicketStatus } from "../enums/ticket-status.enum";
import { TicketType } from "../enums/ticket-type.enum";
import { Types } from "mongoose";

export class CreateTicketDto {
    @IsNotEmpty()
    @IsMongoId()
    projectId!: Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    reportedId!: Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    assignedToId!: Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @IsEnum(TicketStatus)
    status!: TicketStatus;

    @IsNotEmpty()
    @IsEnum(TicketPriority)
    priority!: TicketPriority;
    
    @IsNotEmpty()
    @IsEnum(TicketType)
    type!: TicketType;
}
