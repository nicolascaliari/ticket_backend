import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateClientDto {

    @IsString()
    @IsNotEmpty()
    name!: string;


    @IsEmail()
    @IsNotEmpty()
    email!: string;

}
