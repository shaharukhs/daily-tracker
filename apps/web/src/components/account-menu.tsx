'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

/** Top-right account dropdown: My account + Logout. */
export function AccountMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const initial = (user?.displayName?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-edge bg-white px-2.5 py-1.5 text-sm hover:bg-brand-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[8rem] truncate font-medium sm:inline">
          {user?.displayName}
        </span>
        <span className="text-muted">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-edge bg-white shadow-card"
        >
          <Link
            href="/account"
            role="menuitem"
            className="block px-4 py-2.5 text-sm hover:bg-brand-50"
            onClick={() => setOpen(false)}
          >
            My account
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-sm hover:bg-brand-50"
            onClick={() => {
              setOpen(false);
              void logout().then(() => router.replace('/tracker'));
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
