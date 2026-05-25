// Autor: Jacobo
// Version: 0.1

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PetStatus } from '@prisma/client';

export class ChangePetStatusDto {
  @ApiProperty({ enum: PetStatus })
  @IsEnum(PetStatus)
  status: PetStatus;

  @ApiPropertyOptional({ example: 'Mascota internada por cirugia' })
  @IsString()
  @IsOptional()
  reason?: string;
}
