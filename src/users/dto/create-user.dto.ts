import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { UserRole } from "../enum/user.enum";
import { Types } from "mongoose";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    username!: string;


    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;


    @IsArray()
    @IsEnum(UserRole, { each: true })
    @IsNotEmpty()
    roles!: UserRole[];


    @IsMongoId()
    @IsNotEmpty()
    clientId !: Types.ObjectId;


}
