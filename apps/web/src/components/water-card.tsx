'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';

const GOAL = 10;

export function WaterCard({ date }: { date: string }) {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  const key = ['water', date];

  const { data: glasses = 0, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await authFetch(`/trackers/water/${date}`);
      if (!res.ok) throw new Error('Failed to load');
      const text = await res.text();
      const entry = text ? (JSON.parse(text) as { glasses: number }) : null;
      return entry?.glasses ?? 0;
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: number) => {
      const res = await authFetch('/trackers/water', {
        method: 'PUT',
        body: JSON.stringify({ date, glasses: next }),
      });
      if (!res.ok) throw new Error('Failed to save');
    },
    onMutate: async (next: number) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<number>(key);
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _next, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const setGlasses = (n: number) => mutation.mutate(Math.max(0, n));

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Water Intake</h2>
        <span className="text-sm text-muted">
          {glasses}/{GOAL} glasses
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">Goal: 10 glasses (250ml each) · 3 litres daily</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: GOAL }, (_, i) => {
          const filled = i < glasses;
          return (
            <button
              key={i}
              type="button"
              disabled={isLoading}
              onClick={() => setGlasses(filled && i + 1 === glasses ? i : i + 1)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm transition ${
                filled
                  ? 'border-brand-600 bg-brand-500 text-white'
                  : 'border-stone-300 bg-white text-muted hover:border-brand-400'
              }`}
              aria-label={`${i + 1} glasses`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </section>
  );
}
