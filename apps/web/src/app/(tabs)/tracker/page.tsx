'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ALL_TRACKER_CODES, TRACKER_METADATA } from '@daily-tracker/shared';
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

// Shown to guests (not signed in): all trackers, in canonical order. Writes are gated by useTracker.
const GUEST_PREFS: Preference[] = ALL_TRACKER_CODES.map((code, i) => ({
  trackerCode: code,
  label: TRACKER_METADATA[code].label,
  enabled: true,
  sortOrder: i,
}));

export default function TrackerPage() {
  const { status, authFetch } = useAuth();
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

  const prefs = isAuthed ? fetchedPrefs : GUEST_PREFS;
  const active = prefs.filter((p) => p.enabled && TRACKER_CARDS[p.trackerCode]);

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
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
  );
}
