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
  // Only pictures Readems can actually show: the one the wizard encodes, or
  // one that ships with the app. A remote address would render as a broken
  // image, because the optimiser refuses hosts it was not configured for.
  avatarUrl: z
    .string()
    .max(500_000)
    .refine(
      (value) =>
        value === '' ||
        /^data:image\/(jpeg|png|webp);base64,/.test(value) ||
        /^\/readems\/[\w.-]+\.(png|jpg|jpeg|webp)$/.test(value),
      'Choose a picture from your device.',
    )
    .optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
