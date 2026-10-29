import { Suspense } from 'react';
import { ProgressOverview } from '@/components/features/progress/ProgressOverview';

export default function ProgressPage() {
  return (
    <Suspense fallback={null}>
      <ProgressOverview />
    </Suspense>
  );
}
