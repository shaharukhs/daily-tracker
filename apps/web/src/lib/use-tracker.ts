'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth';

/**
 * Generic per-day tracker hook. Handles load (GET /trackers/<code>/<date>),
 * optimistic save (PUT /trackers/<code>), and cache invalidation.
 *
 * `parse` maps the raw API row (or null when no entry exists) to the form shape;
 * `save(next)` PUTs `{ date, ...next }`.
 */
export function useTracker<T extends Record<string, unknown>>(opts: {
  code: string;
  date: string;
  parse: (raw: Record<string, unknown> | null) => T;
  fallback: T;
}) {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  const key = [opts.code, opts.date];

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await authFetch(`/trackers/${opts.code}/${opts.date}`);
      if (!res.ok) throw new Error('Failed to load');
      const text = await res.text();
      const raw = text ? (JSON.parse(text) as Record<string, unknown>) : null;
      return opts.parse(raw);
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: T) => {
      const res = await authFetch(`/trackers/${opts.code}`, {
        method: 'PUT',
        body: JSON.stringify({ date: opts.date, ...next }),
      });
      if (!res.ok) throw new Error('Failed to save');
    },
    onMutate: async (next: T) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<T>(key);
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _next, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  return {
    data: query.data ?? opts.fallback,
    isLoading: query.isLoading,
    save: (next: T) => mutation.mutate(next),
  };
}
