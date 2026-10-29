import clsx from 'clsx';

interface OptionCardProps {
  title: string;
  desc?: string;
  on: boolean;
  onPick: () => void;
  className?: string;
}

/** Selectable onboarding answer: 18px radius, radio dot on the right; selected = lime border + tint. */
export function OptionCard({ title, desc, on, onPick, className }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={on}
      data-testid={`option-card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      className={clsx(
        'box-border flex w-full items-center gap-4 rounded-[18px] border-[1.5px] px-5 py-[18px] text-left text-fg transition-all duration-150 active:scale-[0.98]',
        on ? 'border-lime bg-lime-select scale-[1.01]' : 'border-line-chip bg-card hover:border-line-mute hover:bg-raised',
        className,
      )}
    >
      <span className="flex-1">
        <span className={clsx('block font-display font-bold', desc ? 'text-[18px]' : 'text-[17px]')}>{title}</span>
        {desc && <span className="mt-1 block text-[15px] text-muted">{desc}</span>}
      </span>
      <span
        aria-hidden="true"
        className={clsx('h-[26px] w-[26px] flex-none rounded-full border-2', on ? 'border-lime bg-lime' : 'border-line-mute')}
      />
    </button>
  );
}
