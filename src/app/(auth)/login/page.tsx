'use client';

import { AuthSplit } from '@/components/features/auth/AuthSplit';
import { LoginForm } from '@/components/features/auth/LoginForm';
import { useSignedOutOnly } from '@/components/features/auth/useSignedOutOnly';

export default function LoginPage() {
  const ready = useSignedOutOnly();
  return (
    <AuthSplit
      intro="Workouts, nutrition and progress in one place, guided by a coach that knows your numbers."
      bullets={['Workouts that adapt every week', 'Calorie and protein tracking in two taps', 'Your data stays yours']}
      footer="© 2026 FitAI"
      formWidth={460}
    >
      {ready ? <LoginForm /> : <div className="min-h-[520px]" aria-busy="true" />}
    </AuthSplit>
  );
}
