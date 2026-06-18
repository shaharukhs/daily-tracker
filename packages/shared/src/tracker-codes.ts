/**
 * Canonical tracker identifiers. Adding a new tracker = add a code here,
 * create a backend module + frontend widget, register both, then map it to
 * subscription plans via the PlanTracker join table.
 */
export const TRACKER_CODES = {
  SALAH: 'salah',
  ADHKAR: 'adhkar',
  QURAN: 'quran',
  EXERCISE: 'exercise',
  WATER: 'water',
  JUNK_FREE: 'junk_free',
  FOOD_LOG: 'food_log',
  WEIGHT: 'weight',
  REFLECTION: 'reflection',
  MEDITATION: 'meditation',
  SLEEP: 'sleep',
  MOOD: 'mood',
  FASTING: 'fasting',
  SADAQAH: 'sadaqah',
  MEDICINE: 'medicine',
} as const;

export type TrackerCode = (typeof TRACKER_CODES)[keyof typeof TRACKER_CODES];

export const ALL_TRACKER_CODES: TrackerCode[] = Object.values(TRACKER_CODES);

export const TRACKER_METADATA: Record<
  TrackerCode,
  { label: string; description: string; defaultEnabled: boolean }
> = {
  [TRACKER_CODES.SALAH]: {
    label: 'Salah — Prayer',
    description: 'Five daily prayers + Sunnah & extras.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.ADHKAR]: {
    label: 'Adhkar — Daily Remembrance',
    description: 'Morning and evening adhkar.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.QURAN]: {
    label: 'Quran — Daily Recitation',
    description: 'Pages read today.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.EXERCISE]: {
    label: 'Exercise & Walking',
    description: 'Daily exercise and step count.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.WATER]: {
    label: 'Water Intake',
    description: 'Goal: 10 glasses (250 ml each).',
    defaultEnabled: true,
  },
  [TRACKER_CODES.JUNK_FREE]: {
    label: 'Junk-Free Today',
    description: 'No fried food, sugary drinks, or packaged snacks.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.FOOD_LOG]: {
    label: 'Food Log',
    description: 'Meals + calories.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.WEIGHT]: {
    label: 'Weekly Weigh-In',
    description: 'Track weight every Sunday.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.REFLECTION]: {
    label: "Today's Reflection",
    description: 'My letter to Allah.',
    defaultEnabled: true,
  },
  [TRACKER_CODES.MEDITATION]: {
    label: 'Meditation',
    description: 'Mindful minutes today.',
    defaultEnabled: false,
  },
  [TRACKER_CODES.SLEEP]: {
    label: 'Sleep',
    description: 'Hours slept and how rested you feel.',
    defaultEnabled: false,
  },
  [TRACKER_CODES.MOOD]: {
    label: 'Mood & Gratitude',
    description: "Today's mood and what you're grateful for.",
    defaultEnabled: false,
  },
  [TRACKER_CODES.FASTING]: {
    label: 'Fasting',
    description: 'Sunnah, Ramadan, and voluntary fasts.',
    defaultEnabled: false,
  },
  [TRACKER_CODES.SADAQAH]: {
    label: 'Sadaqah — Charity',
    description: 'Charity given today.',
    defaultEnabled: false,
  },
  [TRACKER_CODES.MEDICINE]: {
    label: 'Medicine',
    description: 'Your medicines and daily doses.',
    defaultEnabled: false,
  },
};
