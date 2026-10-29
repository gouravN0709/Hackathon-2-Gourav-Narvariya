import { ProgressBar } from '@/components/ui/ProgressBar';
import type { LiftProgress } from '@/lib/selectors';

export function StrengthRow({ lift }: { lift: LiftProgress }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="font-bold">{lift.name}</p>
        <p className="text-[14px] font-bold text-lime">{lift.gain}</p>
      </div>
      <ProgressBar value={lift.pct} label={`${lift.name} at ${lift.pct} percent of goal`} />
      <p className="mt-1.5 text-[13px] text-muted">
        {lift.from} kg → {lift.to} kg · goal {lift.goal} kg
      </p>
    </div>
  );
}
