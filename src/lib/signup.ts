import { z } from 'zod';

export const interests = [
  'Romance',
  'Drama',
  'Fantasy',
  'Mystery',
  'Sci-Fi',
  'Poetry',
  'Non-Fiction',
  'Young Adult',
  'African Folktales',
  'Personal Growth',
] as const;

export const signupSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9_]{3,24}$/,
      'Use 3–24 lowercase letters, numbers, or underscores.',
    ),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(12, 'Use at least 12 characters.')
    .max(128)
    .regex(/[a-z]/, 'Add a lowercase letter.')
    .regex(/[A-Z]/, 'Add an uppercase letter.')
    .regex(/[0-9]/, 'Add a number.'),
  role: z.enum(['READER', 'CREATOR', 'BOTH']),
  interests: z
    .array(z.enum(interests))
    .min(3, 'Choose at least 3 interests.')
    .max(interests.length),
  bio: z.string().trim().max(240).optional(),
  avatarUrl: z.union([z.literal(''), z.url()]).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
