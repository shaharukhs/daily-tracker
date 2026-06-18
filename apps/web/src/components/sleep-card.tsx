'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  hours: number;
  quality: number;
}

export function SleepCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'sleep',
    date,
    fallback: { hours: 0, quality: 0 },
    parse: (raw) => ({ hours: Number(raw?.hours ?? 0), quality: Number(raw?.quality ?? 0) }),
  });

  const [hours, setHours] = useState('');
  const sig = JSON.stringify(data);
  useEffect(() => {
    setHours(data.hours ? String(data.hours) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const commitHours = () => {
    const h = hours.trim() === '' ? 0 : Math.max(0, Math.min(24, Number(hours) || 0));
    if (h !== data.hours) save({ ...data, hours: h });
  };

  return (
    <section className="card p-6">
      <h2 className="section-title">Sleep</h2>
      <div className="mt-4 flex flex-wrap items-end gap-5">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Hours slept</span>
          <input
            type="number"
            step="0.5"
            min={0}
            max={24}
            className="input w-28"
            disabled={isLoading}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onBlur={commitHours}
          />
        </label>
        <div>
          <p className="mb-1 text-sm font-medium">Quality</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((q) => {
              const active = data.quality === q;
              return (
                <button
                  key={q}
                  type="button"
                  disabled={isLoading}
                  onClick={() => save({ ...data, quality: active ? 0 : q })}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${
                    active
                      ? 'border-brand-600 bg-brand-500 text-white'
                      : 'border-stone-300 bg-white text-muted hover:border-brand-400'
                  }`}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
