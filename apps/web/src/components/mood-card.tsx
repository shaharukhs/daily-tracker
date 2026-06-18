'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  mood: number;
  gratitude: string;
}

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

export function MoodCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'mood',
    date,
    fallback: { mood: 0, gratitude: '' },
    parse: (raw) => ({
      mood: Number(raw?.mood ?? 0),
      gratitude: typeof raw?.gratitude === 'string' ? raw.gratitude : '',
    }),
  });

  const [text, setText] = useState('');
  useEffect(() => {
    setText(data.gratitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.gratitude]);

  const commit = () => {
    if (text !== data.gratitude) save({ ...data, gratitude: text.slice(0, 2000) });
  };

  return (
    <section className="card p-6">
      <h2 className="section-title">Mood &amp; Gratitude</h2>
      <p className="mt-3 text-sm font-medium">How are you feeling?</p>
      <div className="mt-2 flex gap-2">
        {MOODS.map((emoji, idx) => {
          const value = idx + 1;
          const active = data.mood === value;
          return (
            <button
              key={value}
              type="button"
              disabled={isLoading}
              onClick={() => save({ ...data, mood: active ? 0 : value })}
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-xl transition ${
                active ? 'border-brand-600 bg-brand-50' : 'border-stone-200 bg-white hover:border-brand-400'
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium">Grateful for…</span>
        <textarea
          className="input min-h-[90px] resize-y"
          placeholder="Three things I'm grateful for today…"
          disabled={isLoading}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
        />
      </label>
    </section>
  );
}
