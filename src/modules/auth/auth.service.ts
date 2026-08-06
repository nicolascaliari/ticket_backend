import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

interface AuthUserInput {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: string;
  permissions?: string[];
  clientId?: string | Types.ObjectId;
  tokenVersion?: number;
}

interface AuthTokenInput {
  id: string;
  email: string;
  role: string;
  permissions?: string[];
  clientId?: string | Types.ObjectId;
  tokenVersion?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET')!;
  }

  private get jwtRefreshExpiresIn(): JwtSignOptions['expiresIn'] {
    return (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
      '60d') as JwtSignOptions['expiresIn'];
  }

  private buildAuthUser(user: AuthUserInput) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      permissions: user.permissions || [],
      clientId: user.clientId?.toString() ?? undefined,
    };
  }

  private buildAccessTokenPayload(user: AuthTokenInput) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      clientId: user.clientId?.toString() ?? undefined,
      tv: user.tokenVersion ?? 0,
    };
  }

  private buildRefreshTokenPayload(user: {
    id: string;
    tokenVersion?: number;
  }) {
    return {
      sub: user.id,
      tv: user.tokenVersion ?? 0,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password!,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = this.buildAccessTokenPayload(user);
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(
      this.buildRefreshTokenPayload(user),
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      },
    );

    return {
      access_token,
      refresh_token,
      user: this.buildAuthUser(user),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.jwtRefreshSecret,
      }) as { sub: string; tv?: number };

      const user = await this.usersService.findOne(decoded.sub);
      const currentTokenVersion = user.tokenVersion ?? 0;

      if ((decoded.tv ?? 0) !== currentTokenVersion) {
        throw new UnauthorizedException('Refresh token revoked');
      }

      const access_token = this.jwtService.sign(
        this.buildAccessTokenPayload(user),
      );

      return {
        access_token,
        user: this.buildAuthUser(user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: string,
    password: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updatePassword(userId, hashedNewPassword);

    const updatedUser = await this.usersService.findOne(userId);
    const access_token = this.jwtService.sign(
      this.buildAccessTokenPayload(updatedUser),
    );
    const refresh_token = this.jwtService.sign(
      this.buildRefreshTokenPayload(updatedUser),
      {
        secret: this.jwtRefreshSecret,
        expiresIn: this.jwtRefreshExpiresIn,
      },
    );

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
      access_token,
      refresh_token,
      user: this.buildAuthUser(updatedUser),
    };
  }
}
