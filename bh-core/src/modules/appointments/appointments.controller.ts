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

import {
 ProcessPaymentDto
} from './dto/process-payment.dto';

import {
 CancelAppointmentDto
} from './dto/cancel-appointment.dto';

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

 @Post(

  'confirm-payment'

 )

 confirmPaymentAndCreate(

  @Body()

  dto:ProcessPaymentDto

 ){

  return this.service
  .createWithPayment(

   dto

  );

 }

 @Patch(

  ':id/payment'

 )

 confirmPayment(

  @Param('id')

  id:string

 ){

  return this.service
  .confirmPayment(

   id

  );

 }

 @Patch(

  ':id/cancel'

 )

 cancelAppointment(

  @Param('id')

  id:string,

  @Body()

  dto:CancelAppointmentDto

 ){

  return this.service
  .cancelAppointment(

   id,

   dto

  );

 }

}