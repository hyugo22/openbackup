import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est requis'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET doit faire au moins 16 caracteres'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN est requis'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Configuration invalide :', parsed.error.flatten().fieldErrors);
  throw new Error('Variables d\'environnement invalides ou manquantes.');
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
