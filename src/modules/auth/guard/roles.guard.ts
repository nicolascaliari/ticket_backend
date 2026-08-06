import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../../../common/enums/roles.enum';
import { ROLES_KEY } from '../decorators/role.decorator';

const ROLE_HIERARCHY: Record<string, number> = {
  // legacy values kept so existing tokens/users keep working
  'super-admin': 2,
  admin: 2,
  agent: 2,
  client: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<Roles>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRole) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) return false;

    if (user.permissions && user.permissions.includes('all')) {
      return true;
    }

    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;

    return userLevel >= requiredLevel;
  }
}
