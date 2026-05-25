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

import { ProcessPaymentDto }
from './dto/process-payment.dto';

import { CancelAppointmentDto }
from './dto/cancel-appointment.dto';

import {
 AppointmentStatus
} from '@prisma/client';

import { HttpService }
from '@nestjs/axios';

import { firstValueFrom }
from 'rxjs';

import { EmailService }
from '../auth/email/email.service';

@Injectable()

export class AppointmentsService{

 constructor(

  private prisma:PrismaService,

  private httpService:HttpService,

  private emailService:EmailService

 ){}

 async create(

  dto:CreateAppointmentDto

 ){

  throw new BadRequestException(

   'Debe procesar el pago antes de crear la cita'

  );

 }

 async createWithPayment(

  dto:ProcessPaymentDto

 ){

  const paymentOk =

  await this.validatePayment(

   dto.transactionId

  );

  if(

   !paymentOk

  ){

   throw new BadRequestException(

    'Pago obligatorio para crear cita'

   );

  }

  const appointmentDate =

  new Date(

   dto.appointmentDate

  );

  const existingAppointment =

  await this.prisma
  .appointment
  .findFirst({

   where:{

    veterinarianId:
    dto.veterinarianId,

    appointmentDate,

    status:{

     in:[

      AppointmentStatus.CONFIRMED

     ]

    }

   }

  });

  if(

   existingAppointment

  ){

   throw new BadRequestException(

    'Horario ocupado'

   );

  }

  const services =

  await this.prisma
  .service
  .findMany({

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

    'Hay servicios inválidos'

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

  await this.prisma
  .appointment
  .create({

   data:{

    petId:
    dto.petId,

    veterinarianId:
    dto.veterinarianId,

    appointmentDate,

    total,

    status:
    AppointmentStatus
    .CONFIRMED,

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

    pet:{

     include:{

      client:true

     }

    },

    veterinarian:true,

    services:true

   }

  });

  await this.notifyAudit(

   'Pago procesado',

   appointment.id

  );

  await this.notifyAudit(

   'Creación de cita',

   appointment.id

  );

  await this.sendAppointmentEmail(

   appointment

  );

  return appointment;

 }

 async cancelAppointment(

  appointmentId:string,

  dto:CancelAppointmentDto

 ){

  if(

   !dto.reason ||

   dto.reason.trim()===''

  ){

   throw new BadRequestException(

    'Debe ingresar un motivo de cancelación'

   );

  }

  const appointment =

  await this.prisma
  .appointment
  .findUnique({

   where:{

    id:appointmentId

   }

  });

  if(

   !appointment

  ){

   throw new BadRequestException(

    'La cita no existe'

   );

  }

  if(

   appointment.status===

   AppointmentStatus.COMPLETED

  ){

   throw new BadRequestException(

    'No se puede cancelar una cita atendida'

   );

  }

  if(

   appointment.status===

   AppointmentStatus.CANCELLED

  ){

   throw new BadRequestException(

    'La cita ya fue cancelada'

   );

  }

  const updated =

  await this.prisma
  .appointment
  .update({

   where:{

    id:appointmentId

   },

   data:{

    status:
    AppointmentStatus.CANCELLED,

    cancelReason:
    dto.reason

   }

  });

  await this.notifyAudit(

   'Cambio de estado de cita',

   updated.id

  );

  return updated;

 }

 async confirmPayment(

  appointmentId:string

 ){

  return this.prisma
  .appointment
  .update({

   where:{

    id:appointmentId

   },

   data:{

    status:
    AppointmentStatus.CONFIRMED

   }

  });

 }

 async preCreate(

  dto:PreCreateAppointmentDto

 ){

  const services =

  await this.prisma
  .service
  .findMany({

   where:{

    id:{

     in:dto.serviceIds

    },

    isActive:true

   }

  });

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

   'READY_TO_PAY'

  };

 }

 private async validatePayment(

  transactionId:string

 ){

  if(

   !transactionId ||

   transactionId.trim()===''

  ){

   return false;

  }

  return true;

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

   console.log(

    'Error auditoría'

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

}