'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { todayIso } from '@/lib/date';
import { DateNav } from '@/components/date-nav';
import { TRACKER_CARDS } from '@/components/tracker-registry';

interface Preference {
  trackerCode: string;
  label: string;
  enabled: boolean;
  sortOrder: number;
}

export default function TrackerPage() {
  const { user, status, logout, authFetch } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState(todayIso());

  useEffect(() => {
    if (status === 'anon') router.replace('/login');
  }, [status, router]);

  const { data: prefs = [], isLoading: prefsLoading } = useQuery({
    queryKey: ['preferences'],
    enabled: status === 'authed',
    queryFn: async () => {
      const res = await authFetch('/preferences');
      if (!res.ok) throw new Error('Failed to load preferences');
      return (await res.json()) as Preference[];
    },
  });

  if (status !== 'authed') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  const active = prefs.filter((p) => p.enabled && TRACKER_CARDS[p.trackerCode]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-edge bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
              Liqā — The Meeting
            </p>
            <h1 className="brand-title text-xl leading-tight">My Daily Tracker</h1>
            <p className="text-xs text-muted">Welcome, {user?.displayName}</p>
          </div>
          <button type="button" className="btn-ghost" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <div className="card p-4">
          <DateNav date={date} onChange={setDate} />
        </div>

        {prefsLoading && <p className="text-center text-sm text-muted">Loading trackers…</p>}

        {active.map(({ trackerCode }) => {
          const Card = TRACKER_CARDS[trackerCode];
          return <Card key={trackerCode} date={date} />;
        })}

        {!prefsLoading && active.length === 0 && (
          <p className="text-center text-sm text-muted">No trackers enabled for your plan.</p>
        )}
      </main>
    </div>
  );
}
