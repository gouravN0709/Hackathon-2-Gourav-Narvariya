'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, isActive } from '@/components/layout/nav';
import { Icon } from '@/components/ui/Icon';

const TABS = NAV_ITEMS.filter((i) => i.id !== 'profile');

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex border-t border-line-side bg-sidebar px-2 pt-1.5 md:hidden"
    >
      {TABS.map((t) => {
        const on = isActive(pathname, t.href);
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={on ? 'page' : undefined}
            data-testid={`mobile-tab-${t.id}`}
            className={clsx(
              'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors duration-150',
              on ? 'text-lime' : 'text-muted hover:text-fg',
            )}
          >
            <span className={clsx('transition-transform duration-200 ease-out', on && 'scale-110')}>
              <Icon name={t.icon} size={22} strokeWidth={1.8} />
            </span>
            {t.short}
          </Link>
        );
      })}
    </nav>
  );
}
