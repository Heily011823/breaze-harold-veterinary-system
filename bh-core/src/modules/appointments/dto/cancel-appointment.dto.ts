import {
 IsString,
 MinLength
} from 'class-validator';

export class CancelAppointmentDto{

 @IsString()

 @MinLength(

 5,

 {
  message:
  'Debe ingresar un motivo de cancelación'
 }

 )

 reason:string;

}