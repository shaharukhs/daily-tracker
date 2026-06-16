'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface LoginGateValue {
  /** Open the "sign in to save" prompt — call when a guest attempts to write data. */
  requestLogin: () => void;
}

const LoginGateContext = createContext<LoginGateValue | null>(null);

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const requestLogin = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <LoginGateContext.Provider value={{ requestLogin }}>
      {children}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={close}
        >
          <div className="card max-w-sm p-7 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-600">
              Keep your progress
            </p>
            <h2 className="brand-title mt-1 text-2xl">Sign in to save</h2>
            <p className="mt-2 text-sm text-muted">
              You&apos;re browsing as a guest. Sign in or create a free account to record your day
              and keep it synced across your devices.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/login" className="btn-primary w-full">
                Sign in
              </Link>
              <Link href="/register" className="btn-ghost w-full">
                Create account
              </Link>
            </div>
            <button
              type="button"
              className="mt-4 text-xs text-muted hover:underline"
              onClick={close}
            >
              Keep looking around
            </button>
          </div>
        </div>
      )}
    </LoginGateContext.Provider>
  );
}

export function useLoginGate(): LoginGateValue {
  const ctx = useContext(LoginGateContext);
  if (!ctx) throw new Error('useLoginGate must be used within <LoginGateProvider>');
  return ctx;
}
