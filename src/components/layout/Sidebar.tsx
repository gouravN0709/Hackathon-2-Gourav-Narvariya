'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/layout/Logo';
import { NAV_ITEMS, isActive } from '@/components/layout/nav';
import { Icon } from '@/components/ui/Icon';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { openCommandPalette } from '@/components/ui/CommandPalette';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { GOAL_NAME } from '@/lib/format';
import { useFitStore } from '@/lib/store';

/**
 * Desktop navigation. 248px wide (78px when collapsed). Between 820 and 1023px it is always shown
 * as the compact rail so the content keeps enough width.
 */
export function Sidebar() {
  const pathname = usePathname();
  const user = useFitStore((s) => s.user);
  const collapsed = useFitStore((s) => s.ui.sidebarCollapsed);
  const setUI = useFitStore((s) => s.setUI);

  const [feedbackOpen, setFeedbackOpen] = useState(false);

  /** Labels hidden: always below lg, and on lg+ when collapsed. */
  const labelCls = clsx('max-lg:hidden', collapsed && 'lg:hidden');

  return (
    <aside
      className={clsx(
        'hidden flex-none border-r border-line-side bg-sidebar md:block',
        'w-[78px]',
        !collapsed && 'lg:w-[248px]',
      )}
    >
      <div className="sticky top-0 box-border flex h-dvh w-full flex-col gap-7 overflow-y-auto px-3.5 py-6">
        <div className="flex items-center justify-between px-1.5">
          <Link href="/dashboard" aria-label="FitAI dashboard" className="flex h-11 items-center">
            <span className="max-lg:hidden">
              <Logo showWordmark={!collapsed} />
            </span>
            <span className="lg:hidden">
              <Logo showWordmark={false} />
            </span>
          </Link>
          {!collapsed && <OfflineIndicator className="max-lg:hidden" />}
        </div>

        <button
          type="button"
          onClick={openCommandPalette}
          aria-label={collapsed ? 'Quick search (⌘K)' : undefined}
          data-testid="sidebar-search"
          className={clsx(
            'flex h-10 items-center gap-2.5 rounded-xl border border-line bg-card px-3 text-[13px] text-muted transition-colors hover:border-line-hover hover:text-fg',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          <div className="flex items-center gap-2">
            <Icon name="search" size={16} className="flex-none" />
            <span className={labelCls}>Quick search</span>
          </div>
          <kbd className={clsx('rounded border border-line-chip bg-sidebar px-1.5 py-0.5 text-[10px] font-bold text-muted', labelCls)}>
            ⌘K
          </kbd>
        </button>

        <nav aria-label="Main" className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const on = isActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={on ? 'page' : undefined}
                title={item.label}
                data-testid={`sidebar-nav-${item.id}`}
                className={clsx(
                  'flex h-[46px] items-center gap-3 rounded-[14px] border px-3.5 text-[15px] font-semibold whitespace-nowrap transition-colors duration-150',
                  on ? 'border-lime-line bg-lime-tint text-lime' : 'border-transparent text-muted hover:bg-row hover:text-fg',
                )}
              >
                <Icon name={item.icon} size={20} strokeWidth={1.8} className="flex-none" />
                <span className={labelCls}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3.5">
          <Link
            href="/profile"
            aria-label={collapsed ? 'Profile and settings' : undefined}
            data-testid="sidebar-profile"
            className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 text-fg transition-colors duration-150 hover:bg-raised"
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-active font-display font-bold text-lime">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className={clsx('min-w-0', labelCls)}>
              <span className="block truncate text-[15px] font-semibold">{user.name}</span>
              <span className="mt-0.5 block truncate text-[13px] text-muted">{GOAL_NAME[user.goal]} · Week 6</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            aria-label={collapsed ? 'Feedback & support' : undefined}
            title="Feedback & support - Report a problem or request a feature"
            data-testid="sidebar-feedback"
            className="flex h-9 items-center justify-center gap-2 rounded-xl px-2.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:bg-row hover:text-fg"
          >
            <Icon name="info" size={16} strokeWidth={2} className="flex-none" />
            <span className={clsx('truncate', labelCls)}>Feedback &amp; support</span>
          </button>
          <button
            type="button"
            onClick={() => setUI({ sidebarCollapsed: !collapsed })}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            data-testid="sidebar-toggle"
            className="hidden h-10 items-center justify-center gap-2.5 rounded-xl border border-line px-3 text-[14px] font-semibold text-muted transition-colors duration-150 hover:bg-row hover:text-fg lg:flex"
          >
            <Icon name="chevronLeft" size={18} className={clsx('transition-transform duration-150', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </aside>
  );
}
