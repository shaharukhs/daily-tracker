'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/tracker', label: 'Today', icon: '🗓️' },
  { href: '/glow-up', label: 'Glow Up', icon: '✨' },
];

/** Responsive tab navigation: top row on desktop, fixed bottom bar on mobile. */
export function TabNav({ variant }: { variant: 'top' | 'bottom' }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  if (variant === 'top') {
    return (
      <nav className="hidden items-center gap-1 md:flex">
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                active ? 'bg-brand-50 text-brand-700' : 'text-muted hover:bg-stone-50'
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-edge bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {TABS.map((t) => {
        const active = isActive(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              active ? 'text-brand-700' : 'text-muted'
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
