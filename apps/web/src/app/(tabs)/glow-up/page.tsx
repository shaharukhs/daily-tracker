'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GLOW_ROUTINES } from '@daily-tracker/shared';
import { useAuth } from '@/lib/auth';
import { useLoginGate } from '@/lib/login-gate';
import { todayIso } from '@/lib/date';
import { DateNav } from '@/components/date-nav';

interface ProductDTO {
  id: string;
  name: string;
  note: string | null;
  routine: string;
  sortOrder: number;
  done: boolean;
}

const ROUTINE_LABEL: Record<string, string> = {
  MORNING: 'Morning',
  EVENING: 'Evening',
  ANYTIME: 'Anytime',
};
const ROUTINE_ICON: Record<string, string> = { MORNING: '🌤️', EVENING: '🌙', ANYTIME: '⏳' };

export default function GlowUpPage() {
  const { status, authFetch } = useAuth();
  const { requestLogin } = useLoginGate();
  const qc = useQueryClient();
  const isGuest = status !== 'authed';
  const [date, setDate] = useState(todayIso());
  const [manage, setManage] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const key = ['glow', date];

  const { data: products = [], isLoading } = useQuery({
    queryKey: key,
    enabled: status === 'authed',
    queryFn: async () => {
      const res = await authFetch(`/glow/${date}`);
      if (!res.ok) throw new Error('Failed to load');
      return (await res.json()) as ProductDTO[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const send = async (path: string, init: RequestInit) => {
    const res = await authFetch(path, init);
    if (!res.ok) throw new Error('Request failed');
    return res;
  };

  const toggleDone = async (p: ProductDTO) => {
    if (isGuest) return requestLogin();
    const done = !p.done;
    qc.setQueryData<ProductDTO[]>(key, (prev) => prev?.map((x) => (x.id === p.id ? { ...x, done } : x)) ?? prev);
    try {
      await send('/glow/log', { method: 'PUT', body: JSON.stringify({ productId: p.id, date, done }) });
    } finally {
      refresh();
    }
  };

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      <div className="card p-4">
        <DateNav date={date} onChange={setDate} />
      </div>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">My Glow Up</h2>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => (isGuest ? requestLogin() : setManage((m) => !m))}
          >
            {manage ? 'Done' : 'Edit'}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Your daily-use products &amp; routine.</p>

        {manage &&
          !isGuest &&
          (adding ? (
            <ProductForm
              onCancel={() => setAdding(false)}
              onSubmit={async (d) => {
                await send('/glow/products', { method: 'POST', body: JSON.stringify(d) });
                setAdding(false);
                refresh();
              }}
            />
          ) : (
            <button
              type="button"
              className="mt-3 text-xs font-medium text-brand-700 hover:underline"
              onClick={() => setAdding(true)}
            >
              + Add product
            </button>
          ))}

        {isGuest ? (
          <p className="mt-3 text-sm text-muted">
            Sign in to add your products and track your routine.
          </p>
        ) : isLoading ? (
          <p className="mt-3 text-sm text-muted">Loading…</p>
        ) : products.length === 0 && !adding ? (
          <p className="mt-3 text-sm text-muted">
            No products yet. Tap Edit → Add product to build your routine.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {GLOW_ROUTINES.map((r) => {
              const items = products.filter((p) => p.routine === r);
              if (items.length === 0) return null;
              return (
                <div key={r}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    {ROUTINE_ICON[r]} {ROUTINE_LABEL[r]}
                  </p>
                  <div className="space-y-2">
                    {items.map((p) =>
                      editingId === p.id ? (
                        <ProductForm
                          key={p.id}
                          initial={{ name: p.name, note: p.note ?? '', routine: p.routine }}
                          onCancel={() => setEditingId(null)}
                          onSubmit={async (d) => {
                            await send(`/glow/products/${p.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ name: d.name, note: d.note ?? null, routine: d.routine }),
                            });
                            setEditingId(null);
                            refresh();
                          }}
                        />
                      ) : (
                        <div key={p.id} className="flex items-center gap-3 rounded-xl border border-edge p-3">
                          <button
                            type="button"
                            onClick={() => void toggleDone(p)}
                            aria-label={p.done ? 'Mark not used' : 'Mark used'}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                              p.done
                                ? 'border-brand-600 bg-brand-500 text-white'
                                : 'border-stone-300 bg-white text-transparent hover:border-brand-400'
                            }`}
                          >
                            ✓
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium ${p.done ? 'text-muted line-through' : ''}`}>
                              {p.name}
                            </p>
                            {p.note && <p className="text-xs text-muted">{p.note}</p>}
                          </div>
                          {manage && (
                            <div className="flex shrink-0 gap-2 text-xs">
                              <button
                                type="button"
                                className="text-brand-700 hover:underline"
                                onClick={() => setEditingId(p.id)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:underline"
                                onClick={async () => {
                                  if (!window.confirm(`Delete "${p.name}"?`)) return;
                                  await send(`/glow/products/${p.id}`, { method: 'DELETE' });
                                  refresh();
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function ProductForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: { name: string; note: string; routine: string };
  onSubmit: (d: { name: string; note?: string; routine: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [routine, setRoutine] = useState<string>(initial?.routine ?? 'MORNING');
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-3 rounded-xl border border-edge p-3">
      <input
        className="input"
        placeholder="Product name (e.g. Vitamin C serum)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input mt-2"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {GLOW_ROUTINES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoutine(r)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              routine === r
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
            }`}
          >
            {ROUTINE_LABEL[r]}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn-primary text-xs"
          disabled={busy || name.trim() === ''}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit({ name: name.trim(), note: note.trim() || undefined, routine });
            } finally {
              setBusy(false);
            }
          }}
        >
          Save
        </button>
        <button type="button" className="btn-ghost text-xs" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
