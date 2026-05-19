import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

/// Autor:  Mateo Quintero 
/// Version: 0.1
/// rama: 17-el registro de consultas

// 👇 Swagger imports
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ========================
  // 🚀 SWAGGER CONFIG
  // ========================
  const config = new DocumentBuilder()
    .setTitle('Veterinary System API')
    .setDescription('API de historial clínico veterinario')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // ========================

  await app.listen(3000);

  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Swagger disponible en http://localhost:3000/api');
}

bootstrap();