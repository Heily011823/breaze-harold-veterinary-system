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

import {AppointmentStatus} 
from '@prisma/client';

@Injectable()
export class AppointmentsService {

 constructor(

  private prisma:PrismaService

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

  return this.prisma.appointment.create({

   data:{

    petId:
     dto.petId,

    veterinarianId:
     dto.veterinarianId,

    appointmentDate,

    total,

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