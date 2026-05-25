/// Autor: ChechoGc
/// Historia: BH-4 - Control de acceso por roles (RBAC)

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Especifica qué roles tienen acceso a un endpoint. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);