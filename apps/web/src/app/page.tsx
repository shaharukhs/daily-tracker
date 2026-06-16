'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Everyone lands on the tracker — authed users see their data, guests get a
    // browsable preview that prompts them to sign in when they try to save.
    if (status !== 'loading') router.replace('/tracker');
  }, [status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-muted">Loading…</p>
    </main>
  );
}
