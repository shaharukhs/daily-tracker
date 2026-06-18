'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  given: boolean;
  amount?: number;
  note?: string;
}

export function SadaqahCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'sadaqah',
    date,
    fallback: { given: false },
    parse: (raw) => ({
      given: Boolean(raw?.given),
      amount: typeof raw?.amount === 'number' ? raw.amount : undefined,
      note: typeof raw?.note === 'string' ? raw.note : undefined,
    }),
  });

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const sig = JSON.stringify(data);
  useEffect(() => {
    setAmount(typeof data.amount === 'number' ? String(data.amount) : '');
    setNote(data.note ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  const commit = (patch: Partial<Form>) =>
    save({
      given: data.given,
      amount: amount.trim() === '' ? undefined : Math.max(0, Number(amount) || 0),
      note: note.trim() === '' ? undefined : note.trim(),
      ...patch,
    });

  return (
    <section className="card p-6">
      <h2 className="section-title">Sadaqah — Charity</h2>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium">Gave charity today</span>
        <div className="flex gap-1.5">
          {[
            { v: true, label: 'Yes' },
            { v: false, label: 'No' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              disabled={isLoading}
              onClick={() => commit({ given: o.v })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                data.given === o.v
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {data.given && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="number"
            min={0}
            placeholder="Amount (optional)"
            className="input w-40"
            disabled={isLoading}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => commit({})}
          />
          <input
            placeholder="Note (optional)"
            className="input w-56"
            disabled={isLoading}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => commit({})}
          />
        </div>
      )}
    </section>
  );
}
