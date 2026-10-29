import { AuthGuard } from '@/components/layout/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <AuthGuard fallback={<div className="min-h-dvh bg-app" aria-busy="true" />}>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
