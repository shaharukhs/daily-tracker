import { z } from 'zod';

/** ISO date (YYYY-MM-DD) — entries are scoped to a calendar day per user. */
export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const salahPrayerStatus = z.enum(['missed', 'qadha', 'on_time', 'in_jamaah']);
export type SalahPrayerStatus = z.infer<typeof salahPrayerStatus>;

export const salahEntrySchema = z.object({
  date: isoDate,
  fajr: salahPrayerStatus.default('missed'),
  dhuhr: salahPrayerStatus.default('missed'),
  asr: salahPrayerStatus.default('missed'),
  maghrib: salahPrayerStatus.default('missed'),
  isha: salahPrayerStatus.default('missed'),
  fajrSunnah: z.boolean().default(false),
  dhuhrSunnah: z.boolean().default(false),
  maghribSunnah: z.boolean().default(false),
  ishaSunnahWitr: z.boolean().default(false),
  tahajjud: z.boolean().default(false),
});
export type SalahEntryInput = z.infer<typeof salahEntrySchema>;

export const waterEntrySchema = z.object({
  date: isoDate,
  glasses: z.number().int().min(0).max(50),
});
export type WaterEntryInput = z.infer<typeof waterEntrySchema>;

export const adhkarEntrySchema = z.object({
  date: isoDate,
  morning: z.boolean().default(false),
  evening: z.boolean().default(false),
});
export type AdhkarEntryInput = z.infer<typeof adhkarEntrySchema>;

export const quranEntrySchema = z.object({
  date: isoDate,
  pages: z.number().int().min(0).max(1000),
});
export type QuranEntryInput = z.infer<typeof quranEntrySchema>;

export const exerciseEntrySchema = z.object({
  date: isoDate,
  exercised: z.boolean().default(false),
  steps: z.number().int().min(0).max(100_000).default(0),
});
export type ExerciseEntryInput = z.infer<typeof exerciseEntrySchema>;

export const junkFreeEntrySchema = z.object({
  date: isoDate,
  junkFree: z.boolean(),
});
export type JunkFreeEntryInput = z.infer<typeof junkFreeEntrySchema>;

/** Time of day as free text (e.g. "07:30"); calories optional per meal. */
const mealTime = z.string().trim().max(10).optional();
const mealCalories = z.number().int().min(0).max(20_000).optional();

export const foodLogEntrySchema = z.object({
  date: isoDate,
  suhoorTime: mealTime,
  suhoorCalories: mealCalories,
  lunchTime: mealTime,
  lunchCalories: mealCalories,
  dinnerTime: mealTime,
  dinnerCalories: mealCalories,
  snackTime: mealTime,
  snackCalories: mealCalories,
});
export type FoodLogEntryInput = z.infer<typeof foodLogEntrySchema>;

export const weightEntrySchema = z.object({
  date: isoDate,
  weightKg: z.number().positive().max(500),
  lostThisWeekKg: z.number().min(-50).max(50).optional(),
});
export type WeightEntryInput = z.infer<typeof weightEntrySchema>;

export const reflectionEntrySchema = z.object({
  date: isoDate,
  text: z.string().max(5000),
});
export type ReflectionEntryInput = z.infer<typeof reflectionEntrySchema>;

export const preferenceUpdateSchema = z.object({
  trackerCode: z.string().min(1).max(64),
  enabled: z.boolean(),
});
export type PreferenceUpdateInput = z.infer<typeof preferenceUpdateSchema>;
