'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Reorder } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { AccountMenu } from '@/components/account-menu';
import { TRACKER_CARDS } from '@/components/tracker-registry';

interface Pref {
  trackerCode: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
}

export default function CustomizePage() {
  const { status, authFetch } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [items, setItems] = useState<Pref[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'anon') router.replace('/login');
  }, [status, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['preferences'],
    enabled: status === 'authed',
    queryFn: async () => {
      const res = await authFetch('/preferences');
      if (!res.ok) throw new Error('Failed to load preferences');
      return (await res.json()) as Pref[];
    },
  });

  useEffect(() => {
    if (data) {
      // Only cards that have a UI component are customizable.
      setItems([...data].filter((p) => TRACKER_CARDS[p.trackerCode]).sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [data]);

  if (status !== 'authed') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  const move = (i: number, dir: -1 | 1) => {
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setSaved(false);
  };

  const toggle = (code: string) => {
    setItems((prev) => prev.map((p) => (p.trackerCode === code ? { ...p, enabled: !p.enabled } : p)));
    setSaved(false);
  };

  const onSave = async () => {
    setBusy(true);
    setSaved(false);
    try {
      const payload = {
        items: items.map((p, idx) => ({
          trackerCode: p.trackerCode,
          enabled: p.enabled,
          sortOrder: idx,
        })),
      };
      const res = await authFetch('/preferences/layout', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('save failed');
      await qc.invalidateQueries({ queryKey: ['preferences'] });
      setSaved(true);
    } catch {
      window.alert('Could not save your layout. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="relative z-30 border-b border-edge bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/tracker" className="brand-title text-xl leading-tight">
            My Daily Tracker
          </Link>
          <AccountMenu />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <Link href="/tracker" className="inline-block text-sm text-brand-700 hover:underline">
          ← Back to tracker
        </Link>

        <section className="card p-6">
          <h2 className="section-title">Customize dashboard</h2>
          <p className="mt-1 text-sm text-muted">
            Drag the handle to reorder, or use the arrows. Toggle a card off to hide it from your
            dashboard — your data is kept.
          </p>

          {isLoading ? (
            <p className="mt-4 text-sm text-muted">Loading…</p>
          ) : (
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={(next: Pref[]) => {
                setItems(next);
                setSaved(false);
              }}
              className="mt-4 space-y-2"
            >
              {items.map((p, i) => (
                <Reorder.Item
                  key={p.trackerCode}
                  value={p}
                  whileDrag={{ scale: 1.02, boxShadow: '0 12px 30px -12px rgba(42,39,35,0.3)' }}
                  className="flex items-center gap-3 rounded-xl border border-edge bg-white px-3 py-2.5"
                >
                  <span
                    aria-hidden
                    className="cursor-grab select-none text-lg leading-none text-muted active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    ⠿
                  </span>
                  <div className="flex flex-col leading-none">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      className="text-xs text-muted hover:text-ink disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={i === items.length - 1}
                      onClick={() => move(i, 1)}
                      className="text-xs text-muted hover:text-ink disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <span className={`flex-1 text-sm font-medium ${p.enabled ? '' : 'text-muted'}`}>
                    {p.label}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.enabled}
                    aria-label={`Toggle ${p.label}`}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    onClick={() => toggle(p.trackerCode)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      p.enabled ? 'bg-brand-600' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        p.enabled ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button type="button" className="btn-primary" disabled={busy} onClick={() => void onSave()}>
              {busy ? 'Saving…' : 'Save layout'}
            </button>
            {saved && <span className="text-sm text-brand-700">Saved ✓</span>}
          </div>
        </section>
      </main>
    </div>
  );
}
