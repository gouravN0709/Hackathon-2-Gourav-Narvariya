import { cn } from '@/lib/cn';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type CardTone = 'default' | 'ai' | 'violet' | 'success';

const tones: Record<CardTone, string> = {
  default: 'bg-card border border-line',
  ai: 'ai-border',
  violet: 'bg-violet-deep border border-violet-line',
  success: 'bg-lime-deep border border-lime-line',
};

/** 20px radius / 22px padding on desktop, 20px radius / 18px padding on mobile. */
export function cardClass(tone: CardTone = 'default', className?: string) {
  return cn('box-border rounded-[20px] p-[18px] md:p-[22px] min-w-0', tones[tone], className);
}

type CardElement = 'div' | 'section' | 'aside' | 'nav' | 'form' | 'article';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement;
  tone?: CardTone;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

export function Card({ as: Tag = 'div', tone = 'default', className, children, ref, ...rest }: CardProps) {
  return (
    <Tag ref={ref as Ref<never>} className={cardClass(tone, className)} {...rest}>
      {children}
    </Tag>
  );
}

/** CardHeader with title + action and standard 16px gap to content */
export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 mb-4', className)}>
      {(title || subtitle) && (
        <div className="min-w-0">
          {typeof title === 'string' ? <h3 className="text-[19px] md:text-[20px] font-bold leading-tight">{title}</h3> : title}
          {subtitle && (typeof subtitle === 'string' ? <p className="mt-1 text-[14px] text-muted">{subtitle}</p> : subtitle)}
        </div>
      )}
      {action && <div className="flex flex-wrap items-center gap-2.5">{action}</div>}
    </div>
  );
}
