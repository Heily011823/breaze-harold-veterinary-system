/// Autor: ChechoGc
/// Historia: BH-3 - Verificación de correo electrónico

import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from =
      process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
  }

  async sendVerificationCode(
    to: string,
    firstName: string,
    code: string,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject:
          'Verifica tu correo electrónico - Breaze & Harold Veterinary',
        html: this.buildVerificationEmail(firstName, code),
      });
    } catch (error) {
      this.logger.error(
        `[email] No se pudo enviar código de verificación a ${to}`,
        error,
      );
    }
  }

  private buildVerificationEmail(firstName: string, code: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
        <div style="border-bottom: 3px solid #2c7a7b; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="color: #2c7a7b; margin: 0;">Breaze &amp; Harold Veterinary System</h2>
        </div>
        <p style="font-size: 16px; color: #333;">Hola <strong>${firstName}</strong>,</p>
        <p style="color: #555;">Gracias por registrarte. Usa el siguiente código para verificar tu correo electrónico:</p>
        <div style="background: #f0fafa; border: 2px solid #2c7a7b; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #2c7a7b;">${code}</span>
        </div>
        <p style="color: #666;">Este código expira en <strong>15 minutos</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">Si no creaste esta cuenta, puedes ignorar este correo de forma segura.</p>
      </div>
    `;
  }
}
