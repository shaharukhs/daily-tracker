import { z } from 'zod';
import { safeLine } from './text';

// Strong password: min 8 chars, upper, lower, digit, special. Defends against weak credentials.
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a digit')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  displayName: safeLine(80, 1),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).max(1024),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
