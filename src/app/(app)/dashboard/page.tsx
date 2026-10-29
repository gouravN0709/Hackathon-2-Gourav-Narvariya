'use client';

import { DashboardDesktop } from '@/components/features/dashboard/DashboardDesktop';
import { DashboardMobile } from '@/components/features/dashboard/DashboardMobile';
import { useDashboard } from '@/components/features/dashboard/useDashboard';
import { PageContainer } from '@/components/ui/Layout';

export default function DashboardPage() {
  const d = useDashboard();
  return (
    <PageContainer>
      <div className="md:hidden">
        <DashboardMobile d={d} />
      </div>
      <div className="max-md:hidden">
        <DashboardDesktop d={d} />
      </div>
    </PageContainer>
  );
}
