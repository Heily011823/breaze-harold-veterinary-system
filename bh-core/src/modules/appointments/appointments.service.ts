import {
 BadRequestException,
 Injectable
} from '@nestjs/common';

import { PrismaService }
from '../../prisma/prisma.service';

import { CreateAppointmentDto }
from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {

 constructor(
  private prisma:PrismaService
 ){}

 async create(
  dto:CreateAppointmentDto
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
      sum+item.price,

     0

    );

   return this.prisma.appointment.create({

    data:{

     petId:
      dto.petId,

     veterinarianId:
      dto.veterinarianId,

     appointmentDate:
      new Date(
       dto.appointmentDate
      ),

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

}