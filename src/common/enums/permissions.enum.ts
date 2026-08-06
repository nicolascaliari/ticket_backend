import { Roles } from './roles.enum';

export enum Permissions {
  ALL = 'all',
  TICKETS_READ = 'tickets:read',
  TICKETS_CREATE = 'tickets:create',
  TICKETS_UPDATE = 'tickets:update',
  TICKETS_ASSIGN = 'tickets:assign',
  TICKETS_CLOSE = 'tickets:close',
  PROJECTS_READ = 'projects:read',
  PROJECTS_MANAGE = 'projects:manage',
  COMMENTS_READ = 'comments:read',
  COMMENTS_CREATE = 'comments:create',
  USERS_MANAGE = 'users:manage',
  CLIENTS_MANAGE = 'clients:manage',
}

export const DEFAULT_PERMISSIONS_BY_ROLE: Record<Roles, Permissions[]> = {
  [Roles.Admin]: [Permissions.ALL],
  [Roles.Client]: [
    Permissions.TICKETS_READ,
    Permissions.TICKETS_CREATE,
    Permissions.TICKETS_UPDATE,
    Permissions.PROJECTS_READ,
    Permissions.PROJECTS_MANAGE,
    Permissions.COMMENTS_READ,
    Permissions.COMMENTS_CREATE,
  ],
};
