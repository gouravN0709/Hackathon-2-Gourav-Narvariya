import clsx from 'clsx';

interface MacroSplitBarProps {
  split: { p: number; c: number; f: number };
  className?: string;
}

/** Calorie share of protein (lime), carbs (violet) and fats (amber). */
export function MacroSplitBar({ split, className }: MacroSplitBarProps) {
  return (
    <div
      className={clsx('flex h-3 gap-[3px] overflow-hidden rounded-full md:h-3.5', className)}
      role="img"
      aria-label={`Macro split of calories eaten: protein ${split.p}, carbs ${split.c}, fats ${split.f} percent`}
    >
      <div className="bg-lime" style={{ width: `${split.p}%` }} />
      <div className="bg-violet" style={{ width: `${split.c}%` }} />
      <div className="bg-amber" style={{ width: `${split.f}%` }} />
    </div>
  );
}
