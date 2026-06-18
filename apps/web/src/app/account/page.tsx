'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AccountMenu } from '@/components/account-menu';

export default function AccountPage() {
  const { user, status, deleteAccount } = useAuth();
  const router = useRouter();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'anon') router.replace('/tracker');
  }, [status, router]);

  if (status !== 'authed' || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading…</p>
      </main>
    );
  }

  const canDelete = confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  async function onDelete() {
    if (!canDelete || busy) return;
    setBusy(true);
    setError(null);
    try {
      await deleteAccount();
      router.replace('/tracker');
    } catch {
      setError('Could not delete your account. Please try again.');
      setBusy(false);
    }
  }

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
          <h2 className="section-title">My account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Name</dt>
              <dd className="font-medium">{user.displayName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
          </dl>
        </section>

        <section className="card border-red-200 p-6">
          <h2 className="text-sm font-semibold text-red-600">Delete account</h2>
          <p className="mt-1 text-sm text-muted">
            Deleting your account signs you out and removes your access to the app and everything
            you&apos;ve tracked. This can&apos;t be undone.
          </p>

          <label className="mt-4 block text-sm">
            <span className="mb-1 block">
              To confirm, type your email <span className="font-medium">{user.email}</span>
            </span>
            <input
              type="email"
              className="input"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={user.email}
              autoComplete="off"
            />
          </label>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            disabled={!canDelete || busy}
            onClick={() => void onDelete()}
            className="btn mt-4 bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Deleting…' : 'Delete account'}
          </button>
        </section>
      </main>
    </div>
  );
}
