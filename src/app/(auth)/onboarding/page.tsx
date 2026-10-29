import { AuthSplit } from '@/components/features/auth/AuthSplit';
import { OnboardingFlow } from '@/components/features/auth/OnboardingFlow';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function OnboardingPage() {
  return (
    <AuthSplit
      intro="Six quick questions and Nova builds a plan around your body, your goal and the way you eat."
      bullets={['Workouts that adapt every week', 'Calorie and protein targets that fit you', 'Your data stays yours']}
      footer="You can change any answer later in Profile & Settings."
      formWidth={560}
    >
      <AuthGuard fallback={<div className="min-h-[420px]" aria-busy="true" />}>
        <OnboardingFlow />
      </AuthGuard>
    </AuthSplit>
  );
}
