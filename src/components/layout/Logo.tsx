import clsx from 'clsx';
import { Icon } from '@/components/ui/Icon';

interface LogoProps {
  /** sidebar: 40px tile / 22px wordmark · auth: 44px tile / 26px wordmark */
  variant?: 'sidebar' | 'auth';
  showWordmark?: boolean;
}

export function Logo({ variant = 'sidebar', showWordmark = true }: LogoProps) {
  const auth = variant === 'auth';
  return (
    <span className="flex items-center gap-3">
      <span
        className={clsx(
          'flex flex-none items-center justify-center rounded-xl bg-lime text-on-lime',
          auth ? 'h-11 w-11' : 'h-10 w-10',
        )}
      >
        <Icon name="bolt" size={auth ? 24 : 22} strokeWidth={2.2} />
      </span>
      {showWordmark && (
        <span className={clsx('font-display font-extrabold tracking-[-0.02em]', auth ? 'text-[26px]' : 'text-[22px]')}>
          Fit<span className="text-lime">AI</span>
        </span>
      )}
    </span>
  );
}
