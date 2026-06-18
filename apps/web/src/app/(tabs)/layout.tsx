'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { AccountMenu } from '@/components/account-menu';
import { TabNav } from '@/components/tab-nav';

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const isAuthed = status === 'authed';

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <header className="relative z-30 border-b border-edge bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
              Liqā — The Meeting
            </p>
            <Link href="/tracker" className="brand-title block text-xl leading-tight">
              My Daily Tracker
            </Link>
            <p className="truncate text-xs text-muted">
              {isAuthed
                ? `Welcome, ${user?.displayName}`
                : 'A daily tracker for the self-dignified Muslim woman'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <TabNav variant="top" />
            {isAuthed ? (
              <AccountMenu />
            ) : (
              <Link href="/login" className="btn-primary">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {!isAuthed && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
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
        </div>
      )}

      {children}

      <TabNav variant="bottom" />
    </div>
  );
}
