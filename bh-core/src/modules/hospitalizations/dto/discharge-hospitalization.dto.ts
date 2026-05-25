/// Autor: milerickhenaor-alt
/// Version: 0.1
/// Rama: BH-23-implementar-registro-alta-egreso-clinico-paciente

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ExitCondition } from '@prisma/client';

export class DischargeHospitalizationDto {
  @IsEnum(ExitCondition)
  @IsNotEmpty()
  exitCondition: ExitCondition;
}