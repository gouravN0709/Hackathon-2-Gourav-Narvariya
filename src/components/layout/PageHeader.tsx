import clsx from 'clsx';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  align?: 'center' | 'end';
}

/** H1 34px (26 on mobile) + 16px muted subtitle, actions on the right. */
export function PageHeader({ title, subtitle, actions, align = 'center' }: PageHeaderProps) {
  return (
    <header
      className={clsx(
        'flex flex-wrap justify-between gap-4 md:gap-5',
        align === 'center' ? 'items-center' : 'items-end',
      )}
    >
      <div>
        <h1 className="text-[26px] leading-[1.15] font-bold md:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-muted md:text-[16px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 w-fit items-center gap-2 text-[15px] font-semibold text-muted transition-colors duration-150 hover:text-fg md:min-h-0"
    >
      <Icon name="chevronLeft" size={18} />
      {children}
    </Link>
  );
}
