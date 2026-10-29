import type { Metadata } from 'next';
import { HelpCenter } from '@/components/features/help/HelpCenter';

export const metadata: Metadata = {
  title: 'Help & Guides · FitAI',
  description: 'Understand every number, chart, calculation, and feature in FitAI.',
};

export default function HelpPage() {
  return <HelpCenter />;
}

