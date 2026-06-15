'use client';

import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  junkFree: boolean | null;
}

export function JunkFreeCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'junk_free',
    date,
    fallback: { junkFree: null },
    parse: (raw) => ({ junkFree: raw ? Boolean(raw.junkFree) : null }),
  });

  const choices = [
    { v: true, label: '✓ Junk Free', on: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
    { v: false, label: '✕ Had Junk', on: 'border-red-400 bg-red-50 text-red-600' },
  ];

  return (
    <section className="card p-6">
      <h2 className="section-title">Junk-Free Today</h2>
      <p className="mt-1 text-xs text-muted">No fried food · no sugary drinks · no packaged snacks</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {choices.map((c) => {
          const active = data.junkFree === c.v;
          return (
            <button
              key={c.label}
              type="button"
              disabled={isLoading}
              onClick={() => save({ junkFree: c.v })}
              className={`rounded-xl border-2 py-3 text-sm font-semibold transition ${
                active ? c.on : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
