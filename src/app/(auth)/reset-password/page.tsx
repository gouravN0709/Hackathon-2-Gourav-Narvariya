'use client';

import { AuthSplit } from '@/components/features/auth/AuthSplit';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthSplit
      intro="Workouts, nutrition and progress in one place, guided by a coach that knows your numbers."
      bullets={['Workouts that adapt every week', 'Calorie and protein tracking in two taps', 'Your data stays yours']}
      footer="© 2026 FitAI"
      formWidth={460}
    >
      <ResetPasswordForm />
    </AuthSplit>
  );
}
