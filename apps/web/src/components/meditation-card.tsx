'use client';

import { useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  minutes: number;
}

const PRESETS = [5, 10, 15, 20];

export function MeditationCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'meditation',
    date,
    fallback: { minutes: 0 },
    parse: (raw) => ({ minutes: Number(raw?.minutes ?? 0) }),
  });

  const [custom, setCustom] = useState('');
  const isPreset = PRESETS.includes(data.minutes);

  return (
    <section className="card p-6">
      <h2 className="section-title">Meditation</h2>
      <p className="mt-1 text-xs text-muted">Mindful minutes today</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {PRESETS.map((m) => {
          const active = data.minutes === m;
          return (
            <button
              key={m}
              type="button"
              disabled={isLoading}
              onClick={() => save({ minutes: active ? 0 : m })}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-300 bg-white text-muted hover:border-brand-400'
              }`}
            >
              {m}m
            </button>
          );
        })}
        <input
          type="number"
          min={0}
          placeholder="other"
          className="input w-28"
          value={!isPreset && data.minutes ? data.minutes : custom}
          onChange={(e) => setCustom(e.target.value)}
          onBlur={() => {
            if (custom !== '') {
              save({ minutes: Math.max(0, Number(custom) || 0) });
              setCustom('');
            }
          }}
        />
      </div>
    </section>
  );
}
