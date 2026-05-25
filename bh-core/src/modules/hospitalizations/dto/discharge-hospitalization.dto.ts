import { IsEnum, IsNotEmpty } from 'class-validator';
import { ExitCondition } from '@prisma/client';

export class DischargeHospitalizationDto {
  @IsEnum(ExitCondition)
  @IsNotEmpty()
  exitCondition: ExitCondition;
}