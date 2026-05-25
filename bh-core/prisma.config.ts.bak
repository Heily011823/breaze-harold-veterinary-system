import 'dotenv/config';


/// Autor: Mateo Quintero
/// Version: 0.1
/// rama: 17-el registro de consultas

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
});