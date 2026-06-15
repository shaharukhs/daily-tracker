'use client';

import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  morning: boolean;
  evening: boolean;
}

export function AdhkarCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'adhkar',
    date,
    fallback: { morning: false, evening: false },
    parse: (raw) => ({ morning: Boolean(raw?.morning), evening: Boolean(raw?.evening) }),
  });

  const rows: { key: keyof Form; label: string; hint: string }[] = [
    { key: 'morning', label: 'Morning Adhkar', hint: 'After Fajr prayer' },
    { key: 'evening', label: 'Evening Adhkar', hint: 'After Asr prayer' },
  ];

  return (
    <section className="card p-6">
      <h2 className="section-title">Adhkar — Daily Remembrance</h2>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <label key={String(r.key)} className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
              checked={Boolean(data[r.key])}
              disabled={isLoading}
              onChange={(e) => save({ ...data, [r.key]: e.target.checked })}
            />
            <span>
              <span className="font-medium">{r.label}</span>
              <span className="ml-2 text-xs text-muted">{r.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
