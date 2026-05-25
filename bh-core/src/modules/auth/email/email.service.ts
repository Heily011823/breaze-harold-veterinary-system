/// Autor: ChechoGc
/// Historia: BH-3 - Verificación de correo electrónico
/// Extendido para BH-XX - Confirmación automática de cita

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {

  private readonly resend: Resend;

  private readonly from: string;

  private readonly logger =
    new Logger(EmailService.name);

  constructor() {

    this.resend =
      new Resend(
        process.env.RESEND_API_KEY
      );

    this.from =
      process.env.RESEND_FROM_EMAIL
      ??
      'onboarding@resend.dev';

  }

  async sendVerificationCode(

    to:string,

    firstName:string,

    code:string,

  ):Promise<void>{

    try{

      await this.resend.emails.send({

        from:this.from,

        to,

        subject:
        'Verifica tu correo electrónico - Breaze & Harold Veterinary',

        html:
        this.buildVerificationEmail(

          firstName,

          code

        ),

      });

    }catch(error){

      this.logger.error(

        `[email] No se pudo enviar código de verificación a ${to}`,

        error,

      );

    }

  }

  async sendAppointmentConfirmation(

    to:string,

    petName:string,

    veterinarian:string,

    date:string,

    address:string,

    reminder:string,

  ):Promise<void>{

    try{

      await this.resend.emails.send({

        from:this.from,

        to,

        subject:
        'Tu cita veterinaria ha sido confirmada',

        html:
        this.buildAppointmentEmail(

          petName,

          veterinarian,

          date,

          address,

          reminder,

        ),

      });

    }catch(error){

      this.logger.error(

        `[email] No se pudo enviar correo de cita a ${to}`,

        error,

      );

    }

  }

  private buildVerificationEmail(

    firstName:string,

    code:string,

  ):string{

    return `

      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">

      <h2 style="color:#2c7a7b;">
      Breaze & Harold Veterinary System
      </h2>

      <p>

      Hola <strong>${firstName}</strong>

      </p>

      <p>

      Usa este código para verificar tu correo:

      </p>

      <div
      style="
      background:#f0fafa;
      border:2px solid #2c7a7b;
      padding:20px;
      text-align:center;
      ">

      <span
      style="
      font-size:40px;
      font-weight:bold;
      letter-spacing:8px;
      ">

      ${code}

      </span>

      </div>

      <p>

      Este código expira en 15 minutos

      </p>

      </div>

    `;

  }

  private buildAppointmentEmail(

    petName:string,

    veterinarian:string,

    date:string,

    address:string,

    reminder:string,

  ):string{

    return `

    <div
    style="
    font-family:Arial,sans-serif;
    max-width:600px;
    margin:0 auto;
    padding:24px;
    ">

    <h2
    style="
    color:#2c7a7b;
    ">

    Cita veterinaria confirmada

    </h2>

    <p>

    Tu cita fue agendada exitosamente.

    </p>

    <hr>

    <p>

    <strong>Mascota:</strong>

    ${petName}

    </p>

    <p>

    <strong>Veterinario:</strong>

    ${veterinarian}

    </p>

    <p>

    <strong>Fecha y hora:</strong>

    ${date}

    </p>

    <p>

    <strong>Dirección sede:</strong>

    ${address}

    </p>

    <div
    style="
    background:#f0fafa;
    padding:15px;
    border-left:5px solid #2c7a7b;
    margin-top:15px;
    ">

    ${reminder}

    </div>

    <p>

    Gracias por confiar en
    Breaze & Harold Veterinary.

    </p>

    </div>

    `;

  }

}