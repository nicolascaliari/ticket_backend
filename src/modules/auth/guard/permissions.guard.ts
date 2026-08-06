import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true; // No permissions required
        }

        const { user } = context.switchToHttp().getRequest();

        // Require the user to exist (should be handled by AuthGuard, but safe to check)
        if (!user) {
            return false;
        }

        const userPermissions = user.permissions || [];

        // Si el usuario tiene el permiso 'all', tiene acceso a todo (super admin)
        if (userPermissions.includes('all')) {
            return true;
        }

        const hasPermission = () => requiredPermissions.some((permission) => userPermissions.includes(permission));


        if (!hasPermission()) {
            throw new ForbiddenException('No tienes los permisos necesarios para realizar esta acción');
        }

        return true;
    }
}
