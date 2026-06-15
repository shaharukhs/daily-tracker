'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';

type Status = 'missed' | 'qadha' | 'on_time' | 'in_jamaah';

interface SalahForm {
  fajr: Status;
  dhuhr: Status;
  asr: Status;
  maghrib: Status;
  isha: Status;
  fajrSunnah: boolean;
  dhuhrSunnah: boolean;
  maghribSunnah: boolean;
  ishaSunnahWitr: boolean;
  tahajjud: boolean;
}

const DEFAULT: SalahForm = {
  fajr: 'missed',
  dhuhr: 'missed',
  asr: 'missed',
  maghrib: 'missed',
  isha: 'missed',
  fajrSunnah: false,
  dhuhrSunnah: false,
  maghribSunnah: false,
  ishaSunnahWitr: false,
  tahajjud: false,
};

const PRAYERS: { key: keyof SalahForm; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

const STATUSES: { value: Status; label: string; cls: string }[] = [
  { value: 'missed', label: 'Missed', cls: 'bg-stone-200 text-stone-700 border-stone-300' },
  { value: 'qadha', label: 'Qadha', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'on_time', label: 'On time', cls: 'bg-sky-100 text-sky-800 border-sky-300' },
  { value: 'in_jamaah', label: 'In Jamaah', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
];

const SUNNAH: { key: keyof SalahForm; label: string }[] = [
  { key: 'fajrSunnah', label: 'Fajr Sunnah (2)' },
  { key: 'dhuhrSunnah', label: 'Dhuhr Sunnah (4+2)' },
  { key: 'maghribSunnah', label: 'Maghrib Sunnah (2)' },
  { key: 'ishaSunnahWitr', label: 'Isha Sunnah + Witr (2+3)' },
  { key: 'tahajjud', label: 'Tahajjud' },
];

export function SalahCard({ date }: { date: string }) {
  const { authFetch } = useAuth();
  const qc = useQueryClient();
  const key = ['salah', date];

  const { data: entry = DEFAULT, isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await authFetch(`/trackers/salah/${date}`);
      if (!res.ok) throw new Error('Failed to load');
      const text = await res.text();
      if (!text) return DEFAULT;
      const raw = JSON.parse(text) as Record<string, unknown>;
      return {
        fajr: String(raw.fajr).toLowerCase() as Status,
        dhuhr: String(raw.dhuhr).toLowerCase() as Status,
        asr: String(raw.asr).toLowerCase() as Status,
        maghrib: String(raw.maghrib).toLowerCase() as Status,
        isha: String(raw.isha).toLowerCase() as Status,
        fajrSunnah: Boolean(raw.fajrSunnah),
        dhuhrSunnah: Boolean(raw.dhuhrSunnah),
        maghribSunnah: Boolean(raw.maghribSunnah),
        ishaSunnahWitr: Boolean(raw.ishaSunnahWitr),
        tahajjud: Boolean(raw.tahajjud),
      } satisfies SalahForm;
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: SalahForm) => {
      const res = await authFetch('/trackers/salah', {
        method: 'PUT',
        body: JSON.stringify({ date, ...next }),
      });
      if (!res.ok) throw new Error('Failed to save');
    },
    onMutate: async (next: SalahForm) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<SalahForm>(key);
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (_e, _next, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });

  const update = (patch: Partial<SalahForm>) => mutation.mutate({ ...entry, ...patch });

  return (
    <section className="card p-6">
      <h2 className="section-title">Salah — Prayer</h2>

      <div className="mt-4 space-y-3">
        {PRAYERS.map((p) => (
          <div key={p.key} className="flex flex-wrap items-center gap-2">
            <span className="w-20 text-sm font-medium">{p.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => {
                const active = entry[p.key] === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    disabled={isLoading}
                    onClick={() => update({ [p.key]: s.value } as Partial<SalahForm>)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active ? s.cls : 'border-stone-200 bg-white text-muted hover:bg-stone-50'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted">
        Sunnah &amp; Extra
      </h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUNNAH.map((s) => {
          const checked = Boolean(entry[s.key]);
          return (
            <label key={s.key} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                checked={checked}
                disabled={isLoading}
                onChange={(e) => update({ [s.key]: e.target.checked } as Partial<SalahForm>)}
              />
              {s.label}
            </label>
          );
        })}
      </div>
    </section>
  );
}
