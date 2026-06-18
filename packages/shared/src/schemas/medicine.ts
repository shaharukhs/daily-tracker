import { z } from 'zod';
import { isoDate } from './trackers';
import { safeLine } from './text';

/** Dose slots a medicine can be taken at. */
export const MEDICINE_SLOTS = [
  'MORNING_BEFORE',
  'MORNING_AFTER',
  'AFTERNOON_BEFORE',
  'AFTERNOON_AFTER',
  'EVENING_BEFORE',
  'EVENING_AFTER',
  'NIGHT_BEFORE',
  'NIGHT_AFTER',
] as const;

export const medicineSlot = z.enum(MEDICINE_SLOTS);
export type MedicineSlot = z.infer<typeof medicineSlot>;

// A "card" groups medicines for one scenario (e.g. "Blood pressure"), with a note on why.
export const createMedicineCardSchema = z.object({
  title: safeLine(80, 1),
  note: safeLine(280).optional(),
});
export type CreateMedicineCardInput = z.infer<typeof createMedicineCardSchema>;

export const updateMedicineCardSchema = z.object({
  title: safeLine(80, 1).optional(),
  note: safeLine(280).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});
export type UpdateMedicineCardInput = z.infer<typeof updateMedicineCardSchema>;

export const createMedicineSchema = z.object({
  name: safeLine(120, 1),
  note: safeLine(280).optional(),
  slots: z.array(medicineSlot).min(1).max(8),
});
export type CreateMedicineInput = z.infer<typeof createMedicineSchema>;

export const updateMedicineSchema = z.object({
  name: safeLine(120, 1).optional(),
  note: safeLine(280).nullable().optional(),
  slots: z.array(medicineSlot).min(1).max(8).optional(),
});
export type UpdateMedicineInput = z.infer<typeof updateMedicineSchema>;

export const medicineDoseSchema = z.object({
  medicineId: z.string().min(1).max(64),
  date: isoDate,
  slot: medicineSlot,
  taken: z.boolean(),
});
export type MedicineDoseInput = z.infer<typeof medicineDoseSchema>;
