'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  suhoorTime?: string;
  suhoorCalories?: number;
  lunchTime?: string;
  lunchCalories?: number;
  dinnerTime?: string;
  dinnerCalories?: number;
  snackTime?: string;
  snackCalories?: number;
}

const str = (v: unknown) => (typeof v === 'string' && v ? v : '');
const num = (v: unknown) => (typeof v === 'number' ? String(v) : '');

const MEALS: { key: string; label: string }[] = [
  { key: 'suhoor', label: 'Suhoor / Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner / Iftar' },
  { key: 'snack', label: 'Snack' },
];

export function FoodLogCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'food_log',
    date,
    fallback: {},
    parse: (raw) => ({
      suhoorTime: str(raw?.suhoorTime) || undefined,
      suhoorCalories: typeof raw?.suhoorCalories === 'number' ? raw.suhoorCalories : undefined,
      lunchTime: str(raw?.lunchTime) || undefined,
      lunchCalories: typeof raw?.lunchCalories === 'number' ? raw.lunchCalories : undefined,
      dinnerTime: str(raw?.dinnerTime) || undefined,
      dinnerCalories: typeof raw?.dinnerCalories === 'number' ? raw.dinnerCalories : undefined,
      snackTime: str(raw?.snackTime) || undefined,
      snackCalories: typeof raw?.snackCalories === 'number' ? raw.snackCalories : undefined,
    }),
  });

  // Local text-field state synced from server whenever the loaded row changes.
  const [form, setForm] = useState<Record<string, string>>({});
  const sig = JSON.stringify(data);
  useEffect(() => {
    setForm({
      suhoorTime: str(data.suhoorTime),
      suhoorCalories: num(data.suhoorCalories),
      lunchTime: str(data.lunchTime),
      lunchCalories: num(data.lunchCalories),
      dinnerTime: str(data.dinnerTime),
      dinnerCalories: num(data.dinnerCalories),
      snackTime: str(data.snackTime),
      snackCalories: num(data.snackCalories),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const commit = () => {
    const next: Form = {};
    for (const m of MEALS) {
      const t = form[`${m.key}Time`]?.trim();
      const c = form[`${m.key}Calories`]?.trim();
      if (t) (next as Record<string, unknown>)[`${m.key}Time`] = t;
      if (c) (next as Record<string, unknown>)[`${m.key}Calories`] = Math.max(0, Number(c) || 0);
    }
    if (JSON.stringify(next) !== JSON.stringify(stripUndefined(data))) save(next);
  };

  return (
    <section className="card p-6">
      <h2 className="section-title">Food Log — What I Ate Today</h2>
      <div className="mt-4 space-y-4">
        {MEALS.map((m) => (
          <div key={m.key}>
            <p className="text-sm font-medium">{m.label}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <input
                className="input w-32"
                placeholder="Time"
                disabled={isLoading}
                value={form[`${m.key}Time`] ?? ''}
                onChange={(e) => set(`${m.key}Time`, e.target.value)}
                onBlur={commit}
              />
              <input
                type="number"
                min={0}
                className="input w-32"
                placeholder="Calories"
                disabled={isLoading}
                value={form[`${m.key}Calories`] ?? ''}
                onChange={(e) => set(`${m.key}Calories`, e.target.value)}
                onBlur={commit}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));
}
