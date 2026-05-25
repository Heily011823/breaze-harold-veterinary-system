import {
 IsArray,
 IsDateString,
 IsNotEmpty,
 IsString
} from 'class-validator';

export class PreCreateAppointmentDto{

 @IsString()
 @IsNotEmpty()
 petId:string;

 @IsString()
 @IsNotEmpty()
 veterinarianId:string;

 @IsDateString()
 appointmentDate:string;

 @IsArray()
 serviceIds:string[];

}