'use client';

import { addDays, prettyDate, todayIso } from '@/lib/date';

export function DateNav({
  date,
  onChange,
}: {
  date: string;
  onChange: (next: string) => void;
}) {
  const isToday = date === todayIso();
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        className="btn-ghost"
        onClick={() => onChange(addDays(date, -1))}
        aria-label="Previous day"
      >
        ←
      </button>

      <div className="text-center">
        <p className="text-sm font-semibold">{prettyDate(date)}</p>
        {!isToday && (
          <button
            type="button"
            className="text-xs text-brand-700 hover:underline"
            onClick={() => onChange(todayIso())}
          >
            Jump to today
          </button>
        )}
      </div>

      <button
        type="button"
        className="btn-ghost"
        onClick={() => onChange(addDays(date, 1))}
        disabled={isToday}
        aria-label="Next day"
      >
        →
      </button>
    </div>
  );
}
