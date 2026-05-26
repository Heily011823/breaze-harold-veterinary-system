/// Autor: ChechoGc
/// Historia: BH-4 - Control de acceso por roles (RBAC)

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guardia global de roles.
 * Si el endpoint no tiene @Roles(), cualquier usuario autenticado puede acceder.
 * Escenario 2 BH-4: rol incorrecto → 403 Forbidden.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{
      user?: {
        role?: UserRole;
      };
    }>();

    const user = request.user;

    return requiredRoles.includes(user?.role as UserRole);
  }
}