import {
 IsArray,
 IsString,
 IsDateString
} from 'class-validator';

export class ProcessPaymentDto{

 @IsString()

 petId:string;

 @IsString()

 veterinarianId:string;

 @IsDateString()

 appointmentDate:string;

 @IsArray()

 serviceIds:string[];

 @IsString()

 transactionId:string;

}