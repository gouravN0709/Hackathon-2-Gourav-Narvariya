import type { IconName } from '@/components/ui/Icon';

export interface NavItem {
  id: 'dashboard' | 'coach' | 'workouts' | 'nutrition' | 'progress' | 'profile';
  label: string;
  short: string;
  href: string;
  icon: IconName;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', short: 'Home', href: '/dashboard', icon: 'dashboard' },
  { id: 'coach', label: 'AI Coach', short: 'Coach', href: '/coach', icon: 'coach' },
  { id: 'workouts', label: 'My Workouts', short: 'Workouts', href: '/workouts', icon: 'dumbbell' },
  { id: 'nutrition', label: 'Nutrition', short: 'Nutrition', href: '/nutrition', icon: 'nutrition' },
  { id: 'progress', label: 'Progress', short: 'Progress', href: '/progress', icon: 'trend' },
  { id: 'profile', label: 'Profile & Settings', short: 'Profile', href: '/profile', icon: 'user' },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
