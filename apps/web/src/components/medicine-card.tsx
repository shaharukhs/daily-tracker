'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MEDICINE_SLOTS } from '@daily-tracker/shared';
import { useAuth } from '@/lib/auth';
import { useLoginGate } from '@/lib/login-gate';

interface MedicineDTO {
  id: string;
  name: string;
  note: string | null;
  slots: string[];
  doses: Record<string, boolean>;
}
interface CardDTO {
  id: string;
  title: string;
  note: string | null;
  sortOrder: number;
  medicines: MedicineDTO[];
}

const SLOT_LABEL: Record<string, string> = {
  MORNING_BEFORE: 'Morning · before breakfast',
  MORNING_AFTER: 'Morning · after breakfast',
  AFTERNOON_BEFORE: 'Afternoon · before meal',
  AFTERNOON_AFTER: 'Afternoon · after meal',
  EVENING_BEFORE: 'Evening · before meal',
  EVENING_AFTER: 'Evening · after meal',
  NIGHT_BEFORE: 'Night · before meal',
  NIGHT_AFTER: 'Night · after meal',
};

// Keep a medicine's slots in canonical chronological order.
const orderSlots = (slots: string[]) => MEDICINE_SLOTS.filter((s) => slots.includes(s));

export function MedicineSection({ date }: { date: string }) {
  const { authFetch, status } = useAuth();
  const { requestLogin } = useLoginGate();
  const qc = useQueryClient();
  const isGuest = status !== 'authed';
  const key = ['medicine', date];

  const { data: cards = [], isLoading } = useQuery({
    queryKey: key,
    enabled: status === 'authed',
    queryFn: async () => {
      const res = await authFetch(`/medicine/${date}`);
      if (!res.ok) throw new Error('Failed to load');
      return (await res.json()) as CardDTO[];
    },
  });

  const [addingCard, setAddingCard] = useState(false);
  const [manage, setManage] = useState<Set<string>>(new Set());
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [addingMedTo, setAddingMedTo] = useState<string | null>(null);
  const [editingMedId, setEditingMedId] = useState<string | null>(null);

  const toggleManage = (id: string) =>
    setManage((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      // leaving edit mode closes any open inline forms for this card
      setEditingCardId(null);
      setAddingMedTo(null);
      setEditingMedId(null);
      return next;
    });

  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const send = async (path: string, init: RequestInit) => {
    const res = await authFetch(path, init);
    if (!res.ok) throw new Error('Request failed');
    return res;
  };

  const toggleDose = async (m: MedicineDTO, slot: string) => {
    if (isGuest) return requestLogin();
    const taken = !m.doses[slot];
    qc.setQueryData<CardDTO[]>(
      key,
      (prev) =>
        prev?.map((c) => ({
          ...c,
          medicines: c.medicines.map((mm) =>
            mm.id === m.id ? { ...mm, doses: { ...mm.doses, [slot]: taken } } : mm,
          ),
        })) ?? prev,
    );
    try {
      await send('/medicine/dose', {
        method: 'PUT',
        body: JSON.stringify({ medicineId: m.id, date, slot, taken }),
      });
    } finally {
      refresh();
    }
  };

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Medicine</h2>
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => (isGuest ? requestLogin() : setAddingCard((v) => !v))}
        >
          + Add card
        </button>
      </div>

      {addingCard && !isGuest && (
        <CardForm
          onCancel={() => setAddingCard(false)}
          onSubmit={async (data) => {
            await send('/medicine/cards', { method: 'POST', body: JSON.stringify(data) });
            setAddingCard(false);
            refresh();
          }}
        />
      )}

      {isGuest ? (
        <p className="mt-3 text-sm text-muted">
          Sign in to add your medicines and track each dose, day by day.
        </p>
      ) : isLoading ? (
        <p className="mt-3 text-sm text-muted">Loading…</p>
      ) : cards.length === 0 && !addingCard ? (
        <p className="mt-3 text-sm text-muted">
          No medicine cards yet. Add one for each scenario (e.g. “Blood pressure”).
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {cards.map((c) => {
            const inManage = manage.has(c.id);
            return (
              <div key={c.id} className="rounded-xl border border-edge p-4">
                {editingCardId === c.id ? (
                  <CardForm
                    initial={{ title: c.title, note: c.note ?? '' }}
                    onCancel={() => setEditingCardId(null)}
                    onSubmit={async (data) => {
                      await send(`/medicine/cards/${c.id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ title: data.title, note: data.note ?? null }),
                      });
                      setEditingCardId(null);
                      refresh();
                    }}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{c.title}</h3>
                      {c.note && <p className="text-xs text-muted">{c.note}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs">
                      {inManage && (
                        <>
                          <button
                            type="button"
                            className="text-brand-700 hover:underline"
                            onClick={() => setEditingCardId(c.id)}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="text-red-600 hover:underline"
                            onClick={async () => {
                              if (!window.confirm(`Delete the "${c.title}" card and its medicines?`))
                                return;
                              await send(`/medicine/cards/${c.id}`, { method: 'DELETE' });
                              refresh();
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="font-medium text-brand-700 hover:underline"
                        onClick={() => toggleManage(c.id)}
                      >
                        {inManage ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  {c.medicines.length === 0 && !inManage && (
                    <p className="text-xs text-muted">No medicines yet — tap Edit to add.</p>
                  )}

                  {c.medicines.map((m) =>
                    editingMedId === m.id ? (
                      <MedicineForm
                        key={m.id}
                        initial={{ name: m.name, note: m.note ?? '', slots: m.slots }}
                        onCancel={() => setEditingMedId(null)}
                        onSubmit={async (data) => {
                          await send(`/medicine/medicines/${m.id}`, {
                            method: 'PATCH',
                            body: JSON.stringify({
                              name: data.name,
                              note: data.note ?? null,
                              slots: data.slots,
                            }),
                          });
                          setEditingMedId(null);
                          refresh();
                        }}
                      />
                    ) : (
                      <div key={m.id} className="rounded-lg bg-stone-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{m.name}</p>
                            {m.note && <p className="text-xs text-muted">{m.note}</p>}
                          </div>
                          {inManage && (
                            <div className="flex shrink-0 gap-2 text-xs">
                              <button
                                type="button"
                                className="text-brand-700 hover:underline"
                                onClick={() => setEditingMedId(m.id)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="text-red-600 hover:underline"
                                onClick={async () => {
                                  if (!window.confirm(`Delete "${m.name}"?`)) return;
                                  await send(`/medicine/medicines/${m.id}`, { method: 'DELETE' });
                                  refresh();
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {orderSlots(m.slots).map((slot) => {
                            const taken = Boolean(m.doses[slot]);
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => void toggleDose(m, slot)}
                                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                  taken
                                    ? 'border-brand-600 bg-brand-500 text-white'
                                    : 'border-stone-300 bg-white text-muted hover:border-brand-400'
                                }`}
                              >
                                {taken ? '✓ ' : ''}
                                {SLOT_LABEL[slot]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}

                  {inManage &&
                    (addingMedTo === c.id ? (
                      <MedicineForm
                        onCancel={() => setAddingMedTo(null)}
                        onSubmit={async (data) => {
                          await send(`/medicine/cards/${c.id}/medicines`, {
                            method: 'POST',
                            body: JSON.stringify(data),
                          });
                          setAddingMedTo(null);
                          refresh();
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="text-xs font-medium text-brand-700 hover:underline"
                        onClick={() => setAddingMedTo(c.id)}
                      >
                        + Add medicine
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Inline forms ────────────────────────────────────────────────────────────

function CardForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: { title: string; note: string };
  onSubmit: (data: { title: string; note?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [busy, setBusy] = useState(false);

  return (
    <div className="mt-3 rounded-xl border border-edge p-3">
      <input
        className="input"
        placeholder="Card title (e.g. Blood pressure)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="input mt-2"
        placeholder="Note — why you take these (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          className="btn-primary text-xs"
          disabled={busy || title.trim() === ''}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit({ title: title.trim(), note: note.trim() || undefined });
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

function MedicineForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: { name: string; note: string; slots: string[] };
  onSubmit: (data: { name: string; note?: string; slots: string[] }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [slots, setSlots] = useState<string[]>(initial?.slots ?? []);
  const [busy, setBusy] = useState(false);

  const toggleSlot = (s: string) =>
    setSlots((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <div className="rounded-lg border border-edge bg-white p-3">
      <input
        className="input"
        placeholder="Medicine name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="input mt-2"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <p className="mt-3 text-xs font-medium text-muted">When is it taken?</p>
      <div className="mt-1.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {MEDICINE_SLOTS.map((s) => {
          const active = slots.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggleSlot(s)}
              className={`rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                active
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
              }`}
            >
              {active ? '✓ ' : ''}
              {SLOT_LABEL[s]}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn-primary text-xs"
          disabled={busy || name.trim() === '' || slots.length === 0}
          onClick={async () => {
            setBusy(true);
            try {
              await onSubmit({ name: name.trim(), note: note.trim() || undefined, slots });
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
