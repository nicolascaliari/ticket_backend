import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { PermissionsGuard } from './guard/permissions.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RolesGuard, PermissionsGuard],
  exports: [AuthService, AuthGuard, RolesGuard, PermissionsGuard],
  imports: [UsersModule],
})
export class AuthModule {}
