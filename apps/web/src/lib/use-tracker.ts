'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './auth';
import { useLoginGate } from './login-gate';

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
  const { authFetch, status } = useAuth();
  const { requestLogin } = useLoginGate();
  const qc = useQueryClient();
  const key = [opts.code, opts.date];
  const isGuest = status !== 'authed';

  const query = useQuery({
    queryKey: key,
    // Guests aren't authenticated — don't hit the API (it would 401); show empty defaults.
    enabled: status === 'authed',
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
    // Guests can explore, but any write prompts them to sign in (nothing is persisted).
    save: (next: T) => {
      if (isGuest) {
        requestLogin();
        return;
      }
      mutation.mutate(next);
    },
  };
}
