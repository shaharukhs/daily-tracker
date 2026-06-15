'use client';

import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  pages: number;
}

const OPTIONS = [1, 2, 3, 4, 5, 6];

export function QuranCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'quran',
    date,
    fallback: { pages: 0 },
    parse: (raw) => ({ pages: Number(raw?.pages ?? 0) }),
  });

  return (
    <section className="card p-6">
      <h2 className="section-title">Quran — Daily Recitation</h2>
      <p className="mt-1 text-xs text-muted">Pages read today</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {OPTIONS.map((n) => {
          const active = data.pages === n;
          const label = n === 6 ? '6+' : String(n);
          return (
            <button
              key={n}
              type="button"
              disabled={isLoading}
              onClick={() => save({ pages: active ? 0 : n })}
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-medium transition ${
                active
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-300 bg-white text-muted hover:border-brand-400'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
