import { AuthGuard } from '@/components/layout/AuthGuard';

/** Full-screen routes (Active Workout): no sidebar or tab bar, as in the design. */
export default function FocusLayout({ children }: LayoutProps<'/'>) {
  return <AuthGuard fallback={<div className="min-h-dvh bg-app" aria-busy="true" />}>{children}</AuthGuard>;
}
