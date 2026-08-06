import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    role: string;
    clientId?: string;
    permissions?: string[];
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Auth(Roles.Admin)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth(Roles.Client)
  findAll(
    @Query('assignable') assignable: string | undefined,
    @Req() req: RequestWithUser,
  ) {
    if (assignable === 'true') {
      return this.usersService.findAll(true);
    }

    if (req.user.role === Roles.Client || req.user.clientId) {
      throw new ForbiddenException('Solo admin puede listar todos los usuarios');
    }

    return this.usersService.findAll(false);
  }

  @Get(':id')
  @Auth(Roles.Admin)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Auth(Roles.Admin)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Auth(Roles.Admin)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
