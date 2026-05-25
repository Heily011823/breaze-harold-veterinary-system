/// Autor: ChechoGc
/// Historia: BH-4 - Control de acceso por roles (RBAC)

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca un endpoint como público — no requiere JWT ni validación de rol. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
