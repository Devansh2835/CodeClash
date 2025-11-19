import { z } from 'zod';

// Auth validators
export const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const resendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// User validators
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
});

export const connectMetaMaskSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

// Game validators
export const submitCodeSchema = z.object({
  matchId: z.string().length(24, 'Invalid match ID'),
  code: z.string().min(1, 'Code cannot be empty').max(10000, 'Code is too long'),
  language: z.enum(['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go'], {
    errorMap: () => ({ message: 'Invalid language' }),
  }),
});

export const getLeaderboardSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1).default(1)).optional(),
});

// AI validators
export const generateProblemSchema = z.object({
  trophies: z.number().min(0).max(10000),
});

export const getHintSchema = z.object({
  problemId: z.string().length(24, 'Invalid problem ID'),
});

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}