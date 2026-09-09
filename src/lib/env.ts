import { z } from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid database URL.'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  // The accounts that become SUPER_ADMIN when they sign in. Checked here so a
  // typo fails at boot rather than quietly granting nobody anything; the admin
  // code reads process.env directly so the list can change without a rebuild.
  READEMS_ADMIN_EMAILS: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        value
          .split(',')
          .every((entry) => z.email().safeParse(entry.trim()).success),
      'READEMS_ADMIN_EMAILS must be a comma separated list of email addresses.',
    ),
});

export const env = serverSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  READEMS_ADMIN_EMAILS: process.env.READEMS_ADMIN_EMAILS,
});
