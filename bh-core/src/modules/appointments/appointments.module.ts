import { Module }
from '@nestjs/common';

import { HttpModule }
from '@nestjs/axios';

import {
 AppointmentsController
}
from './appointments.controller';

import {
 AppointmentsService
}
from './appointments.service';

import {
 PrismaService
}
from '../../prisma/prisma.service';

import {
 EmailService
}
from '../auth/email/email.service';

@Module({

 imports:[

  HttpModule

 ],

 controllers:[

  AppointmentsController

 ],

 providers:[

  AppointmentsService,

  PrismaService,

  EmailService

 ]

})

export class AppointmentsModule{}