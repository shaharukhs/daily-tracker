'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ALL_TRACKER_CODES, TRACKER_METADATA } from '@daily-tracker/shared';
import { useAuth } from '@/lib/auth';
import { todayIso } from '@/lib/date';
import { DateNav } from '@/components/date-nav';
import { TRACKER_CARDS } from '@/components/tracker-registry';
import { AccountMenu } from '@/components/account-menu';

interface Preference {
  trackerCode: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
}

// Shown to guests (not signed in): all trackers, in the canonical order, so they can
// explore the full app. Writes are gated by the login prompt in useTracker.
const GUEST_PREFS: Preference[] = ALL_TRACKER_CODES.map((code, i) => ({
  trackerCode: code,
  label: TRACKER_METADATA[code].label,
  enabled: true,
  sortOrder: i,
}));

export default function TrackerPage() {
  const { user, status, authFetch } = useAuth();
  const [date, setDate] = useState(todayIso());
  const isAuthed = status === 'authed';

  const { data: fetchedPrefs = [], isLoading: prefsLoading } = useQuery({
    queryKey: ['preferences'],
    enabled: isAuthed,
    queryFn: async () => {
      const res = await authFetch('/preferences');
      if (!res.ok) throw new Error('Failed to load preferences');
      return (await res.json()) as Preference[];
    },
  });

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  const prefs = isAuthed ? fetchedPrefs : GUEST_PREFS;
  const active = prefs.filter((p) => p.enabled && TRACKER_CARDS[p.trackerCode]);

  return (
    <div className="min-h-screen">
      <header className="relative z-30 border-b border-edge bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
              Liqā — The Meeting
            </p>
            <h1 className="brand-title text-xl leading-tight">My Daily Tracker</h1>
            <p className="text-xs text-muted">
              {isAuthed ? `Welcome, ${user?.displayName}` : 'A daily tracker for the self-dignified Muslim woman'}
            </p>
          </div>
          {isAuthed ? (
            <AccountMenu />
          ) : (
            <Link href="/login" className="btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        {!isAuthed && (
          <div className="card flex flex-col gap-3 border-gold-400 bg-gold-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <span className="font-semibold">You&apos;re browsing as a guest.</span>{' '}
              <span className="text-muted">Sign in to record your day and keep it synced.</span>
            </p>
            <div className="flex shrink-0 gap-2">
              <Link href="/login" className="btn-primary">
                Sign in
              </Link>
              <Link href="/register" className="btn-ghost">
                Create account
              </Link>
            </div>
          </div>
        )}

        <div className="card p-4">
          <DateNav date={date} onChange={setDate} />
        </div>

        {isAuthed && prefsLoading && (
          <p className="text-center text-sm text-muted">Loading trackers…</p>
        )}

        {active.map(({ trackerCode }) => {
          const Card = TRACKER_CARDS[trackerCode];
          return <Card key={trackerCode} date={date} />;
        })}

        {isAuthed && !prefsLoading && active.length === 0 && (
          <p className="text-center text-sm text-muted">No trackers enabled for your plan.</p>
        )}
      </main>
    </div>
  );
}
