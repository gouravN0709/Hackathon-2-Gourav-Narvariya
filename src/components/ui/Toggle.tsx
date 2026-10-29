'use client';

import { cn } from '@/lib/cn';
import { playTick } from '@/lib/audio';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        playTick();
        onChange(!checked);
      }}
      className={cn(
        'relative h-8 w-[54px] flex-none rounded-full p-0 transition-colors duration-200 ease-out',
        checked ? 'bg-lime' : 'bg-line-strong',
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-6 w-6 rounded-full shadow-xs transition-all duration-200 ease-out',
          checked ? 'left-[26px] bg-on-lime' : 'left-1 bg-white',
        )}
      />
    </button>
  );
}

interface ToggleRowProps extends ToggleProps {
  description: string;
}

export function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line-soft py-3.5">
      <div>
        <p className="font-semibold">{label}</p>
        <p className="mt-0.5 text-[13px] text-muted">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
