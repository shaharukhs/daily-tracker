import type { ComponentType } from 'react';
import { SalahCard } from './salah-card';
import { WaterCard } from './water-card';
import { AdhkarCard } from './adhkar-card';
import { QuranCard } from './quran-card';
import { ExerciseCard } from './exercise-card';
import { JunkFreeCard } from './junk-free-card';
import { FoodLogCard } from './food-log-card';
import { WeightCard } from './weight-card';
import { ReflectionCard } from './reflection-card';
import { MeditationCard } from './meditation-card';
import { SleepCard } from './sleep-card';
import { MoodCard } from './mood-card';
import { FastingCard } from './fasting-card';
import { SadaqahCard } from './sadaqah-card';

/** Maps a tracker code (from the API/preferences) to its UI card. */
export const TRACKER_CARDS: Record<string, ComponentType<{ date: string }>> = {
  salah: SalahCard,
  adhkar: AdhkarCard,
  quran: QuranCard,
  exercise: ExerciseCard,
  water: WaterCard,
  junk_free: JunkFreeCard,
  food_log: FoodLogCard,
  weight: WeightCard,
  reflection: ReflectionCard,
  meditation: MeditationCard,
  sleep: SleepCard,
  mood: MoodCard,
  fasting: FastingCard,
  sadaqah: SadaqahCard,
};
