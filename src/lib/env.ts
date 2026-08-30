import { z } from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid database URL.'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

export const env = serverSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});
