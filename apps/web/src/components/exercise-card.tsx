'use client';

import { useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  exercised: boolean;
  steps: number;
}

const STEP_OPTIONS = [3000, 5000, 7000, 10000];

export function ExerciseCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'exercise',
    date,
    fallback: { exercised: false, steps: 0 },
    parse: (raw) => ({ exercised: Boolean(raw?.exercised), steps: Number(raw?.steps ?? 0) }),
  });

  const [custom, setCustom] = useState('');
  const isPreset = STEP_OPTIONS.includes(data.steps);

  return (
    <section className="card p-6">
      <h2 className="section-title">Exercise &amp; Walking</h2>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium">Exercised today</span>
        <div className="flex gap-1.5">
          {[
            { v: true, label: 'Yes' },
            { v: false, label: 'No / Rest' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              disabled={isLoading}
              onClick={() => save({ ...data, exercised: o.v })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                data.exercised === o.v
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">Walking steps</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {STEP_OPTIONS.map((s) => {
          const active = data.steps === s;
          return (
            <button
              key={s}
              type="button"
              disabled={isLoading}
              onClick={() => save({ ...data, steps: active ? 0 : s })}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-300 bg-white text-muted hover:border-brand-400'
              }`}
            >
              {s.toLocaleString()}
            </button>
          );
        })}
        <input
          type="number"
          min={0}
          placeholder="other"
          className="input w-28"
          value={!isPreset && data.steps ? data.steps : custom}
          onChange={(e) => setCustom(e.target.value)}
          onBlur={() => {
            if (custom !== '') {
              save({ ...data, steps: Math.max(0, Number(custom) || 0) });
              setCustom('');
            }
          }}
        />
      </div>
    </section>
  );
}
