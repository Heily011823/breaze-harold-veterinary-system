/// Autor: milerickhenaor-alt
/// Version: 0.1

import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);