'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { MacroSplitBar } from '@/components/charts/MacroSplitBar';
import { WeightChart } from '@/components/charts/WeightChart';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { StartWorkoutButton } from '@/components/features/dashboard/StartWorkoutLink';
import type { DashboardData } from '@/components/features/dashboard/useDashboard';
import { LinkButton } from '@/components/ui/Button';
import { Card, cardClass } from '@/components/ui/Card';
import { Icon, PlayIcon } from '@/components/ui/Icon';
import { InfoTip } from '@/components/ui/InfoTip';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Ring } from '@/components/ui/Ring';
import { Eyebrow, ExercisePlaceholder, NovaAvatar } from '@/components/ui/misc';
import { NumberStat } from '@/components/ui/NumberStat';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { fmtFull, TODAY } from '@/lib/date';
import { weightSeries } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';

const SPARK_BOX = { W: 340, H: 120, L: 6, R: 6, T: 12, B: 0 };

/** Dedicated 390px layout from Mobile.dc.html. */
export function DashboardMobile({ d }: { d: DashboardData }) {
  const s = useFitData();
  const setUI = useFitStore((st) => st.setUI);
  const series = useMemo(() => weightSeries(s, 30), [s]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium tracking-[0.08em] text-muted uppercase">{fmtFull(TODAY)}</p>
          <h1 className="mt-1 text-[26px] leading-[1.2] font-bold">Good morning, {d.first}!</h1>
          <p className="mt-1 text-[15px] text-muted">Let&apos;s make today count.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <OfflineIndicator />
          <Link
            href="/help"
            aria-label="Help & guides"
            title="Help & guides"
            data-testid="mobile-header-help-button"
            className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full border border-line bg-card text-muted hover:text-fg"
          >
            <Icon name="help" size={20} />
          </Link>
          <Link
            href="/profile"
            aria-label="Open profile and settings"
            className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full border-2 border-lime bg-active font-display text-[18px] font-bold text-lime"
          >
            {d.initial}
          </Link>
        </div>
      </header>

      <Link
        href="/profile"
        className="flex min-h-11 items-center gap-2 rounded-[14px] border border-line bg-card px-3.5 py-2.5 text-[14px] text-fg"
      >
        <span className="text-muted">Goal</span>
        <span className="font-bold">
          <span className="text-lime">{d.goalName}</span> · {d.weight} → {d.goalWeight} kg
        </span>
      </Link>

      {d.tipVisible && (
        <div className="flex items-start gap-3 rounded-[14px] border border-violet-line bg-violet-tint px-3.5 py-3" role="note">
          <Icon name="info" size={18} strokeWidth={1.8} className="mt-0.5 flex-none text-violet" />
          <p className="flex-1 text-[13px] leading-normal text-violet-banner">
            <strong className="text-white">First time here?</strong> Your rings show today&apos;s calories, protein and
            workout. Log a meal, a weight or a workout and everything updates.
          </p>
          <button
            type="button"
            onClick={() => setUI({ tipDismissed: true })}
            aria-label="Got it, dismiss tip"
            data-testid="dashboard-tip-dismiss"
            className="-my-1 min-h-11 px-1 text-[13px] font-semibold text-violet-banner"
          >
            Got it
          </button>
        </div>
      )}

      <section aria-label="Daily summary" data-tour="dashboard-summary" className="flex flex-wrap gap-3">
        <div data-testid="dashboard-calories-card" className={cardClass('default', 'flex flex-[1_1_150px] items-center gap-3 text-fg')}>
          <Link href="/nutrition" aria-label="View nutrition" className="flex-none">
            <Ring size={60} radius={25} stroke={7} value={d.calPct} label={`Calories ${d.calPct} percent`}>
              <span className="font-display text-[13px] font-bold">
                <NumberStat value={d.calPct} suffix="%" />
              </span>
            </Ring>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <Link href="/nutrition" className="text-[12px] font-medium text-muted hover:text-fg">
                Calories
              </Link>
              <InfoTip topicId="calories-ring" size={14} example={`You have ${d.kcalLeft} left today`} />
            </div>
            <Link href="/nutrition" className="block">
              <p className="font-display text-[20px] font-bold">
                <NumberStat value={d.rawKcal} />
              </p>
              <p className="text-[12px] text-muted">of {d.kcalTarget}</p>
            </Link>
          </div>
        </div>

        <div data-testid="dashboard-protein-card" className={cardClass('default', 'flex flex-[1_1_150px] flex-col justify-center gap-2 text-fg')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Link href="/nutrition" className="text-[12px] font-medium text-muted hover:text-fg">
                Protein
              </Link>
              <InfoTip topicId="protein-target" size={14} example={`${d.rawProtein} / ${d.proteinTarget} g logged today`} />
            </div>
            <Pill tone="violet" size="sm">{d.protPct}%</Pill>
          </div>
          <Link href="/nutrition" className="block">
            <p className="font-display text-[20px] font-bold">
              <NumberStat value={d.rawProtein} /> <span className="font-sans text-[13px] font-medium text-muted">/ {d.proteinTarget} g</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={d.protPct} color="violet" label={`Protein ${d.protPct} percent`} />
            </div>
          </Link>
        </div>

        <div data-testid="dashboard-workout-card" className={cardClass('default', 'flex flex-[1_1_150px] flex-col gap-1.5 text-fg')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Link href="/workouts" className="text-[12px] font-medium text-muted hover:text-fg">
                Workout
              </Link>
              <InfoTip topicId="workout-status" size={14} />
            </div>
            <Pill tone="lime" size="sm" className="w-fit">
              {d.done ? 'Done' : d.isRest ? 'Rest' : 'Today'}
            </Pill>
          </div>
          <Link href="/workouts" className="block">
            <p className="font-display text-[16px] font-bold">{d.wName}</p>
            <p className="mt-0.5 text-[12px] text-muted">{d.wSub}</p>
          </Link>
        </div>

        <div data-testid="dashboard-weight-card" className={cardClass('default', 'flex flex-[1_1_150px] flex-col gap-2 text-fg')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Link href="/progress" className="text-[12px] font-medium text-muted hover:text-fg">
                Weight
              </Link>
              <InfoTip topicId="goal-progress" size={14} example={`${d.rawWeight.toFixed(1)} kg (${d.goalPct}% towards ${d.goalWeight} kg)`} />
            </div>
            <Pill size="sm">{d.wDelta}</Pill>
          </div>
          <Link href="/progress" className="block">
            <p className="font-display text-[20px] font-bold">
              <NumberStat value={d.rawWeight} decimals={1} /> <span className="font-sans text-[13px] font-medium text-muted">kg</span>
            </p>
            <div className="mt-2">
              <ProgressBar value={d.goalPct} label={`Goal ${d.goalPct} percent`} />
            </div>
          </Link>
        </div>
      </section>

      <Card className="flex flex-col gap-3.5 p-[18px]">
        <div>
          <Eyebrow className="text-[11px]">Today&apos;s workout</Eyebrow>
          <h2 className="mt-1 text-[22px] font-bold">{d.wName}</h2>
          <p className="mt-1 text-[13px] text-muted">
            {d.isRest ? 'Recovery day · walk and sleep well' : `${d.wMin} min · ${d.wCount} exercises · ~${d.wKcal} kcal`}
          </p>
        </div>
        {!d.isRest && (
          <div className="flex gap-2.5 overflow-hidden">
            {d.exercises.slice(0, 3).map((e) => (
              <div key={e.id} className="min-w-0 flex-[1_1_0]">
                <ExercisePlaceholder iconSize={26} className="h-16 rounded-xl" />
                <p className="mt-1.5 truncate text-[12px] font-semibold">{e.name}</p>
              </div>
            ))}
          </div>
        )}
        {d.isRest ? (
          <LinkButton href="/workouts" variant="ghost" className="w-full">
            Open the planner
          </LinkButton>
        ) : d.done ? (
          <LinkButton href="/progress" className="w-full">
            <Icon name="check" size={16} strokeWidth={2.6} />
            Completed · See progress
          </LinkButton>
        ) : (
          <StartWorkoutButton size="md" className="w-full">
            <PlayIcon size={14} />
            Start Workout
          </StartWorkoutButton>
        )}
      </Card>

      <Card tone="ai" className="flex flex-col gap-3 p-[18px]">
        <div className="flex items-center gap-2.5">
          <NovaAvatar size={34} iconSize={18} strokeWidth={2.2} />
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] font-bold">Your AI Coach</h3>
            <InfoTip topicId="coach-card" />
          </div>
        </div>
        <p className="text-[15px] leading-[1.55]">{d.coachText}</p>
        <LinkButton href="/coach" className="w-full">
          Ask AI Coach
        </LinkButton>
      </Card>

      <QuickActions variant="mobile" />

      <Card className="flex flex-col gap-3 p-[18px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] font-bold">Weight trend</h3>
            <InfoTip topicId="weight-trend" />
          </div>
          <Pill size="sm">{d.wDelta} / 30d</Pill>
        </div>
        <WeightChart series={series} box={SPARK_BOX} variant="compact" label="Weight trend over 30 days" />
      </Card>

      <Card className="flex flex-col gap-3 p-[18px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[17px] font-bold">Nutrition</h3>
            <InfoTip topicId="nutrition-card" />
          </div>
          <Pill size="sm">{d.kcalLeft} kcal left</Pill>
        </div>
        <MacroSplitBar split={d.split} />
        <div className="flex justify-between text-[13px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-lime" />
            Protein {d.totals.p} g
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet" />
            Carbs {d.totals.c} g
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber" />
            Fats {d.totals.f} g
          </span>
        </div>
        <LinkButton href="/nutrition/add" variant="ghost" className="w-full">
          <Icon name="plus" size={16} strokeWidth={2.2} />
          Log Food
        </LinkButton>
      </Card>
    </div>
  );
}
