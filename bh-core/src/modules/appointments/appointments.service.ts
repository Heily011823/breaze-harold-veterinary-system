import {
 BadRequestException,
 Injectable
} from '@nestjs/common';

import { PrismaService }
from '../../prisma/prisma.service';

import { CreateAppointmentDto }
from './dto/create-appointment.dto';

import { PreCreateAppointmentDto }
from './dto/pre-create-appointment.dto';

import { AppointmentStatus }
from '@prisma/client';

import { HttpService }
from '@nestjs/axios';

import { firstValueFrom }
from 'rxjs';

import { EmailService }
from '../auth/email/email.service';

@Injectable()

export class AppointmentsService {

 constructor(

  private prisma:PrismaService,

  private httpService:HttpService,

  private emailService:EmailService

 ){}

 async create(

  dto:CreateAppointmentDto

 ){

  const appointmentDate =
   new Date(

    dto.appointmentDate

   );

  const existingAppointment =
   await this.prisma.appointment.findFirst({

    where:{

     veterinarianId:
      dto.veterinarianId,

     appointmentDate,

     status:{

      in:[

       AppointmentStatus.CONFIRMED,

       AppointmentStatus.PENDING_PAYMENT

      ]

     }

    }

   });

  if(

   existingAppointment

  ){

   throw new BadRequestException(

    'El veterinario ya tiene una cita en ese horario'

   );

  }

  const services =
   await this.prisma.service.findMany({

    where:{

     id:{

      in:dto.serviceIds

     },

     isActive:true

    }

   });

  if(

   services.length
   !==
   dto.serviceIds.length

  ){

   throw new BadRequestException(

    'Hay servicios inactivos'

   );

  }

  const total =
   services.reduce(

    (sum,item)=>

     sum+
     item.price,

    0

   );

  const appointment =

  await this.prisma.appointment.create({

   data:{

    petId:
    dto.petId,

    veterinarianId:
    dto.veterinarianId,

    appointmentDate,

    total,

    status:
    AppointmentStatus
    .PENDING_PAYMENT,

    services:{

     create:

     dto.serviceIds.map(

      id=>({

       serviceId:id

      })

     )

    }

   },

   include:{

    services:true

   }

  });

  await this.notifyAudit(

   'Creación de cita',

   appointment.id

  );

  return appointment;

 }

 async confirmPayment(

  appointmentId:string

 ){

  const appointment =

  await this.prisma.appointment.update({

   where:{

    id:appointmentId

   },

   data:{

    status:
    AppointmentStatus.CONFIRMED

   },

   include:{

    pet:{

     include:{

      client:true

     }

    },

    veterinarian:true

   }

  });

  await this.notifyAudit(

   'Pago de cita registrado',

   appointment.id

  );

  await this.sendAppointmentEmail(

   appointment

  );

  return appointment;

 }

 private async notifyAudit(

  event:string,

  appointmentId:string

 ){

  try{

   await firstValueFrom(

    this.httpService.post(

     'http://localhost:3001/api/v1/audit/events',

     {

      actionType:event,

      userId:'SYSTEM',

      userFullName:'SYSTEM',

      userRole:'SYSTEM',

      description:event,

      metadata:{

       appointmentId

      }

     }

    )

   );

  }catch(error){

   console.error(

    'Error notificando auditoría'

   );

  }

 }

 private async sendAppointmentEmail(

  appointment:any

 ){

  const veterinarian =

  appointment
  .veterinarian
  ?.firstName

  ||

  'Veterinario asignado';

  const date =

  new Date(

   appointment
   .appointmentDate

  ).toLocaleString(

   'es-CO'

  );

  await this.emailService
  .sendAppointmentConfirmation(

   appointment
   .pet
   .client
   .email,

   appointment
   .pet
   .name,

   veterinarian,

   date,

   'Sede Principal',

   'Recuerda llegar 10 minutos antes'

  );

 }

 async preCreate(

  dto:PreCreateAppointmentDto

 ){

  const services =
  await this.prisma.service.findMany({

   where:{

    id:{

     in:dto.serviceIds

    },

    isActive:true

   }

  });

  if(

   services.length
   !==
   dto.serviceIds.length

  ){

   throw new BadRequestException(

    'Hay servicios inactivos'

   );

  }

  const total =

  services.reduce(

   (sum,item)=>

   sum+
   item.price,

   0

  );

  return{

   petId:
   dto.petId,

   veterinarianId:
   dto.veterinarianId,

   appointmentDate:
   dto.appointmentDate,

   services,

   total,

   status:

   'READY_TO_CONFIRM'

  };

 }

}