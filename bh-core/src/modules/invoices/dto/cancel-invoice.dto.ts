import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelInvoiceDto {
  @ApiProperty({
    example: 'Factura anulada por error en los datos del cliente.',
    description: 'Motivo obligatorio para anular la factura.',
  })
  @IsString()
  @IsNotEmpty()
reason!: string;
}