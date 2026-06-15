'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  weightKg?: number;
  lostThisWeekKg?: number;
}

const MILESTONES = [79.5, 77, 75, 73, 71, 69, 67, 65, 63];

export function WeightCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'weight',
    date,
    fallback: {},
    parse: (raw) => ({
      weightKg: typeof raw?.weightKg === 'number' ? raw.weightKg : undefined,
      lostThisWeekKg: typeof raw?.lostThisWeekKg === 'number' ? raw.lostThisWeekKg : undefined,
    }),
  });

  const [weight, setWeight] = useState('');
  const [lost, setLost] = useState('');
  const sig = JSON.stringify(data);
  useEffect(() => {
    setWeight(typeof data.weightKg === 'number' ? String(data.weightKg) : '');
    setLost(typeof data.lostThisWeekKg === 'number' ? String(data.lostThisWeekKg) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const commit = () => {
    const w = Number(weight);
    if (!weight.trim() || !(w > 0)) return; // weight is required + positive
    const next: Form = { weightKg: w };
    if (lost.trim() !== '') next.lostThisWeekKg = Number(lost) || 0;
    save(next);
  };

  return (
    <section className="card p-6">
      <h2 className="section-title">Weekly Weigh-In</h2>
      <p className="mt-1 text-xs text-muted">Track weight every Sunday</p>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Today&apos;s weight (kg)</span>
          <input
            type="number"
            step="0.1"
            min={0}
            className="input w-36"
            disabled={isLoading}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={commit}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Lost this week (kg)</span>
          <input
            type="number"
            step="0.1"
            className="input w-36"
            disabled={isLoading}
            value={lost}
            onChange={(e) => setLost(e.target.value)}
            onBlur={commit}
          />
        </label>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
        Milestone targets
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {MILESTONES.map((m) => {
          const reached = typeof data.weightKg === 'number' && data.weightKg <= m;
          return (
            <span
              key={m}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs ${
                reached
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-300 bg-white text-muted'
              }`}
            >
              {m}
            </span>
          );
        })}
      </div>
    </section>
  );
}
