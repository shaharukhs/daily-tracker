'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authed') router.replace('/tracker');
    else if (status === 'anon') router.replace('/login');
  }, [status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-muted">Loading…</p>
    </main>
  );
}
