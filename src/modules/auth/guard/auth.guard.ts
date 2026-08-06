import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

interface AccessTokenPayload {
  sub: string;
  tv?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.getTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
        token,
        {
          secret: this.configService.get('JWT_SECRET'),
        },
      );

      const usersService = this.moduleRef.get(UsersService, { strict: false });
      const tokenVersion = await usersService.getTokenVersion(payload.sub);
      if (tokenVersion === null) {
        throw new UnauthorizedException('Unauthorized');
      }

      if ((payload.tv ?? 0) !== tokenVersion) {
        throw new UnauthorizedException('Token revoked');
      }

      request['user'] = payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }

  private getTokenFromRequest(request: Request): string | null {
    if (!request.headers.authorization) {
      return null;
    }

    const [type, token] = request.headers.authorization.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
