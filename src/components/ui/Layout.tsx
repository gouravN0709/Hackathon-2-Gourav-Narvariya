import clsx from 'clsx';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type SpacingScale = 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 22 | 24 | 32 | 40 | 56;

const GAP_CLASSES: Record<SpacingScale, string> = {
  4: 'gap-1',
  6: 'gap-1.5',
  8: 'gap-2',
  10: 'gap-2.5',
  12: 'gap-3',
  14: 'gap-3.5',
  16: 'gap-4',
  18: 'gap-[18px]',
  22: 'gap-[22px]',
  24: 'gap-6',
  32: 'gap-8',
  40: 'gap-10',
  56: 'gap-14',
};

/**
 * Standard PageContainer matching Brand OS & Design specs:
 * Desktop: 32px top, 40px sides, 56px bottom. Max width ~1280px centered.
 * Tablet (820px): 24px sides.
 * Mobile (390px): 24px top, 20px sides, ~96px bottom (never covered by tab bar).
 */
export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}

export function PageContainer({ as: Tag = 'div', children, className, ...rest }: PageContainerProps) {
  return (
    <Tag
      className={clsx(
        'box-border min-w-0 w-full max-w-[1280px] mx-auto',
        'px-5 pt-6 pb-24 md:px-6 md:pt-8 md:pb-14 lg:px-10',
        'flex flex-col gap-6',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Vertical stack layout with strict FitAI spacing scale.
 * Default gap: 24px (for page sections) or specified by prop.
 */
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  gap?: SpacingScale;
  align?: 'start' | 'center' | 'end' | 'stretch';
  children: ReactNode;
  className?: string;
}

const ALIGN_STACK: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export function Stack({ as: Tag = 'div', gap = 24, align, children, className, ...rest }: StackProps) {
  return (
    <Tag
      className={clsx(
        'flex flex-col min-w-0',
        GAP_CLASSES[gap] ?? 'gap-6',
        align && ALIGN_STACK[align],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Horizontal row layout with wrapping and strict FitAI spacing scale.
 * Default gap: 18px (for cards in a row) or specified.
 */
export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  gap?: SpacingScale;
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  children: ReactNode;
  className?: string;
}

const ALIGN_ROW: Record<string, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

const JUSTIFY_ROW: Record<string, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export function Row({
  as: Tag = 'div',
  gap = 18,
  wrap = true,
  align = 'center',
  justify,
  children,
  className,
  ...rest
}: RowProps) {
  return (
    <Tag
      className={clsx(
        'flex min-w-0',
        wrap ? 'flex-wrap' : 'flex-nowrap',
        GAP_CLASSES[gap] ?? 'gap-[18px]',
        align && ALIGN_ROW[align],
        justify && JUSTIFY_ROW[justify],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Responsive Auto-Fit Grid or Column Grid.
 * Min card widths matching design: 250 (stats), 340 (cards), 520 (split panels).
 * Default gap: 18px.
 */
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  gap?: SpacingScale;
  min?: 250 | 300 | 340 | 520 | number;
  cols?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export function Grid({ as: Tag = 'div', gap = 18, min = 250, cols, children, className, ...rest }: GridProps) {
  const gapClass = GAP_CLASSES[gap] ?? 'gap-[18px]';

  if (cols) {
    const colClasses: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    };
    return (
      <Tag className={clsx('grid min-w-0', colClasses[cols], gapClass, className)} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={clsx('grid min-w-0', gapClass, className)}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

