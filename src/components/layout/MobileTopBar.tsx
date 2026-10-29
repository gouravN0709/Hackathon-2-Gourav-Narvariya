'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { Icon } from '@/components/ui/Icon';
import { openCommandPalette } from '@/components/ui/CommandPalette';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { useFitStore } from '@/lib/store';

/** Compact header below 820px so Profile stays one tap away. The dashboard has its own header. */
export function MobileTopBar() {
  const pathname = usePathname();
  const name = useFitStore((s) => s.user.name);
  if (pathname === '/dashboard') return null;
  return (
    <div className="flex items-center justify-between px-5 pt-5 md:hidden">
      <Link href="/dashboard" aria-label="FitAI dashboard">
        <Logo />
      </Link>
      <div className="flex items-center gap-2.5">
        <OfflineIndicator />
        <button
          type="button"
          onClick={openCommandPalette}
          aria-label="Quick search and actions"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-muted hover:text-fg"
        >
          <Icon name="search" size={18} />
        </button>
        <Link
          href="/help"
          aria-label="Help & guides"
          title="Help & guides"
          data-testid="mobile-topbar-help"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-muted hover:text-fg"
        >
          <Icon name="help" size={18} />
        </Link>
        <Link
          href="/profile"
          aria-label="Open profile and settings"
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-lime bg-active font-display text-[17px] font-bold text-lime"
        >
          {name.charAt(0).toUpperCase()}
        </Link>
      </div>
    </div>
  );
}
