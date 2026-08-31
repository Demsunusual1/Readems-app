import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email('Enter a valid email address.'))
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1, 'Enter your password.').max(128),
});
