import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { MobileTopBar } from '@/components/layout/MobileTopBar';
import { PageTransition } from '@/components/layout/PageTransition';

export interface AppShellProps {
  children: ReactNode;
}

/**
 * Standard AppShell layout primitive:
 * - Desktop: Sidebar 248px (78px collapsed/rail at 820–1023px)
 * - Mobile: MobileTopBar + MobileTabBar (fixed bottom bar)
 * - Main: min-w-0 flex-1 overflow-x-hidden
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-app">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <MobileTopBar />
        <main className="min-w-0 flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}

