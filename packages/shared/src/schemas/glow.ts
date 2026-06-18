import { z } from 'zod';
import { isoDate } from './trackers';
import { safeLine } from './text';

/** When a daily-use product is used. */
export const GLOW_ROUTINES = ['MORNING', 'EVENING', 'ANYTIME'] as const;
export const glowRoutine = z.enum(GLOW_ROUTINES);
export type GlowRoutine = z.infer<typeof glowRoutine>;

export const createGlowProductSchema = z.object({
  name: safeLine(80, 1),
  note: safeLine(280).optional(),
  routine: glowRoutine,
});
export type CreateGlowProductInput = z.infer<typeof createGlowProductSchema>;

export const updateGlowProductSchema = z.object({
  name: safeLine(80, 1).optional(),
  note: safeLine(280).nullable().optional(),
  routine: glowRoutine.optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});
export type UpdateGlowProductInput = z.infer<typeof updateGlowProductSchema>;

export const glowLogSchema = z.object({
  productId: z.string().min(1).max(64),
  date: isoDate,
  done: z.boolean(),
});
export type GlowLogInput = z.infer<typeof glowLogSchema>;
