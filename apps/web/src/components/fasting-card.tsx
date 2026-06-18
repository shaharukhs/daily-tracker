'use client';

import { useTracker } from '@/lib/use-tracker';

type FastType = 'ramadan' | 'sunnah' | 'qadha' | 'voluntary';

interface Form extends Record<string, unknown> {
  fasted: boolean;
  fastType?: FastType;
}

const TYPES: { v: FastType; label: string }[] = [
  { v: 'ramadan', label: 'Ramadan' },
  { v: 'sunnah', label: 'Sunnah' },
  { v: 'qadha', label: 'Qadha' },
  { v: 'voluntary', label: 'Voluntary' },
];

export function FastingCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'fasting',
    date,
    fallback: { fasted: false },
    parse: (raw) => ({
      fasted: Boolean(raw?.fasted),
      fastType: (raw?.fastType as FastType | undefined) ?? undefined,
    }),
  });

  return (
    <section className="card p-6">
      <h2 className="section-title">Fasting</h2>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium">Fasted today</span>
        <div className="flex gap-1.5">
          {[
            { v: true, label: 'Yes' },
            { v: false, label: 'No' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              disabled={isLoading}
              onClick={() => save({ fasted: o.v, fastType: o.v ? data.fastType : undefined })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                data.fasted === o.v
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {data.fasted && (
        <>
          <p className="mt-4 text-xs text-muted">Type of fast</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TYPES.map((t) => {
              const active = data.fastType === t.v;
              return (
                <button
                  key={t.v}
                  type="button"
                  disabled={isLoading}
                  onClick={() => save({ ...data, fastType: active ? undefined : t.v })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
