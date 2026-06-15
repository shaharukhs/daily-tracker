'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/lib/use-tracker';

interface Form extends Record<string, unknown> {
  text: string;
}

export function ReflectionCard({ date }: { date: string }) {
  const { data, save, isLoading } = useTracker<Form>({
    code: 'reflection',
    date,
    fallback: { text: '' },
    parse: (raw) => ({ text: typeof raw?.text === 'string' ? raw.text : '' }),
  });

  const [text, setText] = useState('');
  useEffect(() => {
    setText(data.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.text]);

  const commit = () => {
    if (text !== data.text) save({ text: text.slice(0, 5000) });
  };

  return (
    <section className="card p-6">
      <h2 className="section-title">Today&apos;s Reflection — My Letter to Allah</h2>
      <textarea
        className="input mt-3 min-h-[140px] resize-y leading-relaxed"
        placeholder="Ya Allah —"
        disabled={isLoading}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
      />
      <p className="mt-1 text-right text-xs text-muted">{text.length}/5000</p>
    </section>
  );
}
