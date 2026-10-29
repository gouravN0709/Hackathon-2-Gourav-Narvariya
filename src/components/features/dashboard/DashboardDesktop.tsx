'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MacroSplitBar } from '@/components/charts/MacroSplitBar';
import { WeightChart } from '@/components/charts/WeightChart';
import { QuickActions } from '@/components/features/dashboard/QuickActions';
import { StartWorkoutButton } from '@/components/features/dashboard/StartWorkoutLink';
import type { DashboardData } from '@/components/features/dashboard/useDashboard';
import { LinkButton } from '@/components/ui/Button';
import { Card, cardClass } from '@/components/ui/Card';
import { Icon, PlayIcon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Ring } from '@/components/ui/Ring';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Eyebrow, ExercisePlaceholder, NovaAvatar } from '@/components/ui/misc';
import { NumberStat } from '@/components/ui/NumberStat';
import { Stack } from '@/components/ui/Layout';
import { fmtFull, TODAY } from '@/lib/date';
import { signed } from '@/lib/format';
import { latestWeight, weightSeries } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';

const CHART_BOX = { W: 640, H: 240, L: 44, R: 16, T: 18, B: 30 };

export function DashboardDesktop({ d }: { d: DashboardData }) {
  const setUI = useFitStore((s) => s.setUI);
  return (
    <Stack gap={24}>
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-muted uppercase">{fmtFull(TODAY)}</p>
          <h1 className="mt-1.5 text-[38px] leading-[1.15] font-bold">Good morning, {d.first}!</h1>
          <p className="mt-1.5 text-[17px] text-muted">Let&apos;s make today count.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <Link
            href="/profile"
            className="flex flex-col gap-0.5 rounded-2xl border border-line bg-card px-[18px] py-3 text-fg transition-colors duration-150 hover:bg-raised"
          >
            <span className="text-[13px] font-medium text-muted">Current goal</span>
            <span className="text-[16px] font-bold">
              <span className="text-lime">{d.goalName}</span> · {d.weight} → {d.goalWeight} kg
            </span>
          </Link>
          <Link
            href="/profile"
            aria-label="Open profile"
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-lime bg-active font-display text-[20px] font-bold text-lime"
          >
            {d.initial}
          </Link>
        </div>
      </header>

      {d.tipVisible && (
        <div className="flex items-center gap-3.5 rounded-[14px] border border-violet-line bg-violet-tint px-4 py-3" role="note">
          <Icon name="info" size={20} strokeWidth={1.8} className="flex-none text-violet" />
          <p className="flex-1 text-[14px] leading-normal text-violet-banner">
            <strong className="text-white">First time here?</strong> Your rings show today&apos;s calories, protein and workout.
            Log a meal, a weight or a workout and everything updates.
          </p>
          <button
            type="button"
            onClick={() => setUI({ tipDismissed: true })}
            aria-label="Got it, dismiss tip"
            data-testid="dashboard-tip-dismiss"
            className="h-[34px] rounded-full px-3.5 text-[13px] font-semibold text-violet-banner transition-colors duration-150 hover:text-fg"
          >
            Got it
          </button>
        </div>
      )}

      <section aria-label="Daily summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px]">
        <Link href="/nutrition" data-testid="dashboard-calories-card" className={cardClass('default', 'flex items-center gap-[18px] text-fg hover:bg-raised')}>
          <Ring size={96} radius={38} stroke={9} value={d.calPct} label={`Calories ${d.calPct} percent of target`}>
            <span className="font-display text-[20px] font-bold">
              <NumberStat value={d.calPct} suffix="%" />
            </span>
          </Ring>
          <div>
            <p className="text-[13px] font-medium text-muted">Calories</p>
            <p className="mt-0.5 font-display text-[28px] font-bold">
              <NumberStat value={d.rawKcal} />
            </p>
            <p className="text-[14px] text-muted">
              of {d.kcalTarget} kcal · {d.kcalLeft} left
            </p>
          </div>
        </Link>

        <Link href="/nutrition" data-testid="dashboard-protein-card" className={cardClass('default', 'flex flex-col justify-center gap-3 text-fg hover:bg-raised')}>
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] font-medium text-muted">Protein</p>
            <Pill tone="violet">
              <NumberStat value={d.protPct} suffix="%" />
            </Pill>
          </div>
          <p className="font-display text-[28px] font-bold">
            <NumberStat value={d.rawProtein} /> <span className="font-sans text-[16px] font-medium text-muted">/ {d.proteinTarget} g</span>
          </p>
          <ProgressBar value={d.protPct} color="violet" label={`Protein ${d.protPct} percent of target`} />
          <p className="text-[14px] text-muted">{d.protNote}</p>
        </Link>

        <Link href="/workouts" data-testid="dashboard-workout-card" className={cardClass('default', 'flex flex-col justify-center gap-2.5 text-fg hover:bg-raised')}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-muted">Today&apos;s workout</p>
            <Pill tone="lime">{d.wStatus}</Pill>
          </div>
          <p className="font-display text-[22px] font-bold">{d.wName}</p>
          <p className="text-[14px] text-muted">{d.wSub}</p>
          <WeekSegments segs={d.segs} done={d.sessionsDone} />
        </Link>

        <Link href="/progress" data-testid="dashboard-weight-card" className={cardClass('default', 'flex flex-col justify-center gap-3 text-fg hover:bg-raised')}>
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] font-medium text-muted">Current weight</p>
            <Pill>{d.wDelta} / 30d</Pill>
          </div>
          <p className="font-display text-[28px] font-bold">
            <NumberStat value={d.rawWeight} decimals={1} />{' '}
            <span className="font-sans text-[16px] font-medium text-muted">kg → {d.goalWeight} kg</span>
          </p>
          <ProgressBar value={d.goalPct} label={`Goal progress ${d.goalPct} percent`} />
          <p className="text-[14px] text-muted">
            <NumberStat value={d.goalPct} suffix="%" /> of the way · {d.toGo} kg to go
          </p>
        </Link>
      </section>

      <QuickActions variant="desktop" />

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[18px] items-stretch">
        <TodayWorkoutCard d={d} />
        <CoachCard d={d} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-[18px] items-stretch">
        <WeightTrendCard />
        <NutritionCard d={d} />
      </section>
    </Stack>
  );
}

export function WeekSegments({ segs, done }: { segs: DashboardData['segs']; done: number }) {
  return (
    <div className="flex gap-1.5" role="img" aria-label={`${done} of 4 sessions done this week`}>
      {segs.map((s, i) => (
        <div
          key={i}
          className={clsx(
            'h-2 flex-1 rounded-full',
            s === 'done' ? 'bg-lime' : 'bg-line',
            s === 'today' && 'outline-[1.5px] -outline-offset-[1.5px] outline-lime outline-solid',
          )}
        />
      ))}
    </div>
  );
}

function TodayWorkoutCard({ d }: { d: DashboardData }) {
  if (d.isRest) {
    return (
      <Card className="flex min-w-0 flex-col gap-5 justify-between">
        <div>
          <Eyebrow>Today&apos;s workout</Eyebrow>
          <h2 className="mt-1.5 text-[30px] font-bold">Rest day</h2>
          <p className="mt-3 max-w-[420px] text-[15px] leading-normal text-muted">
            Recovery is when muscle is built. Nova recommends a 20 minute walk and 8 hours of sleep.
          </p>
        </div>
        <LinkButton href="/workouts" variant="ghost" size="lg" className="w-fit">
          Open the planner
        </LinkButton>
      </Card>
    );
  }
  return (
    <Card className="flex min-w-0 flex-col gap-5 justify-between">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Today&apos;s workout</Eyebrow>
          <h2 className="mt-1.5 text-[30px] font-bold">{d.wName}</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <Pill>
              <Icon name="clock" size={14} />
              {d.wMin} min
            </Pill>
            <Pill>
              <Icon name="dumbbell" size={14} />
              {d.wCount} exercises
            </Pill>
            <Pill>~{d.wKcal} kcal</Pill>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <LinkButton href="/workouts" variant="ghost" className="h-[52px]">
            View plan
          </LinkButton>
          {d.done ? (
            <LinkButton href="/progress" size="lg">
              <Icon name="check" size={16} strokeWidth={2.6} />
              Completed · See progress
            </LinkButton>
          ) : (
            <StartWorkoutButton size="lg">
              <PlayIcon />
              Start Workout
            </StartWorkoutButton>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3.5">
        {d.exercises.map((e) => (
          <div key={e.id} className="min-w-0 flex-[1_1_130px]">
            <ExercisePlaceholder iconSize={44} className="h-28" />
            <p className="mt-2.5 text-[15px] font-semibold">{e.name}</p>
            <p className="mt-0.5 text-[13px] text-muted">{e.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CoachCard({ d }: { d: DashboardData }) {
  return (
    <Card tone="ai" className="flex min-w-0 flex-col gap-4 justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <NovaAvatar size={42} iconSize={22} />
          <h3 className="text-[19px] font-bold">Your AI Coach</h3>
        </div>
        <p className="text-[17px] leading-[1.55]">{d.coachText}</p>
        <div className="flex flex-col gap-2.5">
          <p className="rounded-xl bg-raised px-3.5 py-3 text-[14px] leading-normal text-soft">{d.insight1}</p>
          <p className="rounded-xl bg-raised px-3.5 py-3 text-[14px] leading-normal text-soft">{d.insight2}</p>
        </div>
      </div>
      <LinkButton href="/coach" className="mt-2 w-full">
        Ask AI Coach
      </LinkButton>
    </Card>
  );
}

function WeightTrendCard() {
  const s = useFitData();
  const [range, setRange] = useState<7 | 30>(30);
  const series = useMemo(() => weightSeries(s, range), [s, range]);
  const w = latestWeight(s);
  const delta = w - s.user.startWeight;
  return (
    <Card className="flex min-w-0 flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[19px] font-bold">Weight progress</h3>
          <p className="mt-1 text-[14px] text-muted">
            {signed(delta)} kg {range === 7 ? 'this week' : 'in 30 days'} · on track
          </p>
        </div>
        <SegmentedControl<7 | 30>
          label="Range"
          size="sm"
          track="card"
          value={range}
          onChange={setRange}
          options={[
            { value: 7, label: '7d' },
            { value: 30, label: '30d' },
          ]}
        />
      </div>
      <WeightChart series={series} box={CHART_BOX} label="Weight progress line chart" />
    </Card>
  );
}

function NutritionCard({ d }: { d: DashboardData }) {
  const protLeft = Math.max(0, d.targets.protein - d.totals.p);
  return (
    <Card className="flex min-w-0 flex-col gap-4 justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-bold">Today&apos;s nutrition</h3>
          <Link href="/nutrition" className="text-[13px] font-semibold text-lime hover:underline">
            View log
          </Link>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-display text-[26px] font-bold">
              <NumberStat value={d.rawKcal} /> <span className="font-sans text-[14px] font-medium text-muted">/ {d.kcalTarget} kcal</span>
            </p>
            <p className="text-[13px] text-muted">{d.kcalLeft} kcal left today</p>
          </div>
          <div className="text-right">
            <p className="font-display text-[26px] font-bold text-violet-soft">
              <NumberStat value={d.rawProtein} /> <span className="font-sans text-[14px] font-medium text-muted">/ {d.proteinTarget} g</span>
            </p>
            <p className="text-[13px] text-muted">{protLeft} g protein left</p>
          </div>
        </div>
        <MacroSplitBar split={d.split} />
        <dl className="grid grid-cols-3 gap-2 rounded-xl bg-raised p-3 text-center">
          <div>
            <dt className="text-[12px] text-muted">Protein</dt>
            <dd className="mt-0.5 font-bold text-lime">{d.totals.p} g</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted">Carbs</dt>
            <dd className="mt-0.5 font-bold text-violet-soft">{d.totals.c} g</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted">Fats</dt>
            <dd className="mt-0.5 font-bold text-amber">{d.totals.f} g</dd>
          </div>
        </dl>
      </div>
      <LinkButton href="/nutrition/add" variant="ghost" className="w-full">
        Log meal
      </LinkButton>
    </Card>
  );
}
