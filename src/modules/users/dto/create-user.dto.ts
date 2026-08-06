import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Roles } from '../../../common/enums/roles.enum';

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

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEnum(Roles)
  @IsNotEmpty()
  role!: Roles;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];

  @ValidateIf((dto: CreateUserDto) => dto.role === Roles.Client)
  @IsMongoId()
  @IsNotEmpty()
  clientId?: string;
}
