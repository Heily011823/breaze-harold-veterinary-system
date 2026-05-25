import {
 Body,
 Controller,
 Post,
 Patch,
 Param
} from '@nestjs/common';

import {
 AppointmentsService
} from './appointments.service';

import {
 CreateAppointmentDto
} from './dto/create-appointment.dto';

import {
 PreCreateAppointmentDto
} from './dto/pre-create-appointment.dto';

@Controller('appointments')

export class AppointmentsController {

 constructor(

  private readonly service:
   AppointmentsService

 ){}

 @Post()

 create(

  @Body()
  dto:CreateAppointmentDto

 ){

  return this.service.create(

   dto

  );

 }

 @Post('pre-create')

 preCreate(

  @Body()
  dto:PreCreateAppointmentDto

 ){

  return this.service.preCreate(

   dto

  );

 }

 @Patch(':id/payment')

 confirmPayment(

  @Param('id')

  id:string

 ){

  return this.service
  .confirmPayment(

   id

  );

 }

}