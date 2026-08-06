import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from './decorators/auth.decorator';
import { Roles } from '../../common/enums/roles.enum';


interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }


  @Post('refresh-token')
  @HttpCode(200)
  refreshToken(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, tokenRefresh] = authHeader.split(' ');
    if (type !== 'Bearer' || !tokenRefresh) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    return this.authService.refreshToken(tokenRefresh);
  }

  @Post('change-password')
  @Auth(Roles.Client)
  async changePassword(
    @Req() request: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const { password, newPassword } = changePasswordDto;
    return this.authService.changePassword(request.user.sub, password, newPassword);
  }
}
