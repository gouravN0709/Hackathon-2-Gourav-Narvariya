'use client';

import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusText } from '@/components/ui/Alert';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Label } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { InfoTip } from '@/components/ui/InfoTip';
import { EmptyState, Eyebrow, NovaAvatar } from '@/components/ui/misc';
import { showToast } from '@/components/ui/Toast';
import { PageContainer, Stack } from '@/components/ui/Layout';
import { MUSCLE_GROUPS } from '@/lib/data/workouts';
import { GOAL_NAME, mmss, setLine } from '@/lib/format';
import { createClient } from '@/lib/supabase/client';
import { sessionsThisWeek, today, todayIndex, week, workoutExercises, type WeekDay } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';
import { playTick } from '@/lib/audio';
import type { DayStatus, Exercise } from '@/types/domain';

const STATUS_LABEL: Record<DayStatus, string> = { done: 'DONE', today: 'TODAY', planned: 'PLANNED', missed: 'MISSED', rest: 'REST' };
const STATUS_COLOR: Record<DayStatus, string> = {
  done: 'text-lime',
  today: 'text-lime',
  planned: 'text-muted',
  missed: 'text-amber',
  rest: 'text-muted',
};
const REGEN_MS = 1300;

export function WorkoutsPlanner() {
  const s = useFitData();
  const setUI = useFitStore((st) => st.setUI);
  const days = useMemo(() => week(s), [s]);
  const tIdx = todayIndex();
  const selIdx = s.ui.workoutDay ?? tIdx;
  const sel = days[selIdx];
  const td = today(s);

  const [regen, setRegen] = useState<'idle' | 'loading' | 'done'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const regenerate = () => {
    if (regen === 'loading') return;
    setRegen('loading');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setRegen('done');
      // Reload from Supabase so the chips/week view reflect the fresh plan.
      void useFitStore.getState().bootstrap();
    };
    timer.current = window.setTimeout(finish, REGEN_MS);
    void (async () => {
      try {
        const client = createClient();
        const { data } = await client.auth.getUser();
        if (!data?.user) throw new Error('NO_SESSION');
        const { error } = await client.rpc('regenerate_plan', { p_user: data.user.id });
        if (error) throw error;
        finish();
      } catch (err) {
        window.clearTimeout(timer.current);
        setRegen('idle');
        showToast('Could not regenerate the plan. Try again.', 'error');
        console.warn('[FitAI] plan regeneration failed:', err);
      }
    })();
  };

  const touchStartRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current;
    if (deltaX < -45 && selIdx < 6) {
      playTick();
      setUI({ workoutDay: selIdx + 1 });
    } else if (deltaX > 45 && selIdx > 0) {
      playTick();
      setUI({ workoutDay: selIdx - 1 });
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="My Workouts"
        subtitle={`Week of Oct 12 · ${sessionsThisWeek(s)} of 4 sessions done`}
        actions={
          <LinkButton href="/workouts/details" onClick={() => setUI({ workoutDay: tIdx })}>
            <Icon name="dumbbell" size={16} />
            {td.status === 'done' ? "View today's workout" : "Open today's workout"}
          </LinkButton>
        }
      />

      <Stack gap={24}>
        <Card tone="ai" as="section" className="flex flex-wrap items-center gap-5" aria-label="AI-generated plan">
          <NovaAvatar size={48} iconSize={24} />
          <div className="min-w-0 flex-[1_1_360px]">
            <div className="flex items-center gap-1.5">
              <Eyebrow tone="violet">AI-generated plan</Eyebrow>
              <InfoTip topicId="ai-plan" />
            </div>
            <h2 className="mt-1 text-[20px] font-bold md:text-[22px]">4-day split · Week 6 of 12</h2>
            <p className="mt-1.5 text-[15px] leading-normal text-muted">
              Built by Nova from your {GOAL_NAME[s.user.goal].toLowerCase()} goal, 4 training days and last week&apos;s lifts. Bench
              and squat get +2.5 kg this week.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {regen === 'done' && (
              <Pill tone="lime" role="status">
                <Icon name="check" size={13} strokeWidth={2.8} />
                Plan refreshed
              </Pill>
            )}
            <Button variant="ghost" size="sm" onClick={regenerate} disabled={regen === 'loading'} data-testid="regenerate-plan-button">
              {regen === 'loading' ? 'Regenerating…' : 'Regenerate plan'}
            </Button>
          </div>
        </Card>

        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <h2 className="text-[14px] font-semibold text-muted">Weekly schedule</h2>
            <InfoTip topicId="calendar-statuses" />
          </div>
          <section
            aria-label="Weekly calendar"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 select-none"
          >
            {days.map((d) => (
              <DayChip
                key={d.date}
                day={d}
                on={d.i === selIdx}
                onPick={() => {
                  playTick();
                  setUI({ workoutDay: d.i });
                }}
              />
            ))}
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <SelectedDay day={sel} exercises={sel.workout ? workoutExercises(s, sel.workout.key) : []} />
          <aside className="flex min-w-0 flex-col gap-6">
            <MuscleGroups days={days} extras={s.ui.extras} />
            <Routines />
          </aside>
        </div>
      </Stack>
    </PageContainer>
  );
}

function DayChip({ day, on, onPick }: { day: WeekDay; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={on}
      data-testid={`workout-day-${day.dow.toLowerCase()}`}
      className={clsx(
        'flex min-w-0 flex-col gap-1.5 rounded-[18px] border p-4 text-left text-fg transition-colors duration-150',
        on ? 'border-lime bg-lime-select' : 'border-line bg-card hover:border-line-hover hover:bg-raised',
      )}
    >
      <span className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-muted">{day.dow}</span>
        <span className="font-display text-[20px] font-bold">{day.num}</span>
      </span>
      <span className="mt-1 text-[15px] font-semibold">{day.name}</span>
      <span className={clsx('text-[12px] font-bold tracking-[0.06em]', STATUS_COLOR[day.status])}>{STATUS_LABEL[day.status]}</span>
    </button>
  );
}

function SelectedDay({ day, exercises }: { day: WeekDay; exercises: Exercise[] }) {
  const w = day.workout;
  return (
    <Card className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-muted">
            {day.dowFull}, Oct {day.num}
            {day.status === 'today' ? ' · Today' : ''}
          </p>
          <h2 className="mt-1 text-[24px] font-bold md:text-[28px]">{day.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <Pill>{w ? `${w.minutes} min` : 'Recovery'}</Pill>
            <Pill>{w ? `${exercises.length} exercises` : 'No training'}</Pill>
            {day.status === 'done' && (
              <Pill tone="lime">
                <Icon name="check" size={13} strokeWidth={2.8} />
                Completed
              </Pill>
            )}
          </div>
        </div>
        {w && <LinkButton href="/workouts/details" data-testid="open-workout-button">Open workout</LinkButton>}
      </div>

      {!w && (
        <EmptyState className="px-6 py-12">
          <Icon name="moon" size={40} strokeWidth={1.5} className="text-muted" />
          <p className="font-display text-[20px] font-bold">Rest day</p>
          <p className="max-w-[360px] text-[15px] leading-normal text-muted">
            Recovery is when muscle is built. Nova recommends a 20 minute walk and 8 hours of sleep.
          </p>
        </EmptyState>
      )}

      {w && (
        <Stack gap={12}>
          <ul className="flex flex-col gap-3">
            {exercises.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-[14px] border border-line bg-row px-4 py-3"
              >
                <div className="min-w-0 flex-[1_1_220px]">
                  <p className="text-[16px] font-bold">{e.name}</p>
                  <p className="mt-[3px] text-[13px] text-muted">{e.muscle}</p>
                </div>
                <p className="text-[14px] font-semibold text-soft">
                  {setLine(e)} · rest {mmss(e.rest)}
                </p>
              </li>
            ))}
          </ul>
        </Stack>
      )}
    </Card>
  );
}

function MuscleGroups({ days, extras }: { days: WeekDay[]; extras: Record<string, Exercise[] | undefined> }) {
  const [group, setGroup] = useState<string>('Chest');
  const all = useMemo(() => {
    return days.flatMap((d) => {
      const w = d.workout;
      if (!w) return [];
      const base = w.exercises;
      const extra = extras[w.key] ?? [];
      return [...base, ...extra].map((e) => ({ e, day: d.name }));
    });
  }, [days, extras]);

  const hit = (e: Exercise, kw: string[]) => kw.some((k) => e.muscle.toLowerCase().includes(k) || e.name.toLowerCase().includes(k));
  const current = MUSCLE_GROUPS.find((g) => g.name === group);

  return (
    <Card>
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[19px] font-bold">Muscle groups</h3>
          <InfoTip topicId="muscle-groups" />
        </div>
        <p className="mt-1 text-[14px] text-muted">Tap a muscle to see where it appears in your week.</p>
      </div>
      <div className="flex flex-col gap-2">
        {MUSCLE_GROUPS.map((g) => {
          const on = group === g.name;
          const count = all.filter((a) => hit(a.e, g.kw)).length;
          return (
            <button
              key={g.name}
              type="button"
              aria-pressed={on}
              aria-expanded={on}
              onClick={() => setGroup(on ? '' : g.name)}
              className={clsx(
                'box-border flex w-full items-center gap-3.5 rounded-[14px] border p-3 text-left text-fg transition-colors duration-150',
                on ? 'border-lime-line bg-lime-tint' : 'border-transparent hover:border-line-chip hover:bg-raised',
              )}
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-active font-display text-[14px] font-bold text-lime">
                {g.short}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{g.name}</span>
                <span className="block text-[13px] text-muted">{count} exercises in your plan</span>
              </span>
            </button>
          );
        })}
      </div>
      {current && (
        <ul className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4" aria-label={`${current.name} exercises`}>
          {all
            .filter((a) => hit(a.e, current.kw))
            .map((a) => (
              <li key={`${a.day}-${a.e.id}`} className="flex justify-between gap-3 text-[14px]">
                <span className="font-semibold">{a.e.name}</span>
                <span className="text-muted">{a.day}</span>
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
}

function Routines() {
  const routines = useFitStore((s) => s.ui.routines);
  const setUI = useFitStore((s) => s.setUI);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  const create = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setErr('Name your routine first.');
    if (routines.some((r) => r.toLowerCase() === n.toLowerCase())) return setErr('You already have a routine with that name.');
    setUI({ routines: [...routines, n] });
    setName('');
    setErr('');
    setOpen(false);
  };

  return (
    <Card tone="violet">
      <div className="flex items-center gap-1.5">
        <Eyebrow tone="violet">My routines</Eyebrow>
        <InfoTip topicId="custom-routines" />
      </div>
      {routines.length === 0 ? (
        <p className="mt-2 text-[15px] leading-[1.55] text-violet-text">
          No custom routines yet. Start one from scratch and add exercises to it.
        </p>
      ) : (
        <ul className="flex flex-col gap-2 mt-2">
          {routines.map((r) => (
            <li key={r} className="text-[15px] font-semibold text-violet-text">
              • {r}
            </li>
          ))}
        </ul>
      )}
      {open && (
        <form onSubmit={create} noValidate className="mt-4 flex flex-col gap-3">
          <div>
            <Label htmlFor="rn" className="text-violet-banner mb-1.5 block">
              Routine name
            </Label>
            <Field
              id="rn"
              fieldSize="sm"
              placeholder="e.g. Quick upper body"
              data-testid="routine-name-input"
              value={name}
              invalid={!!err}
              onChange={(e) => {
                setName(e.target.value);
                setErr('');
              }}
            />
          </div>
          {err && <StatusText tone="error">{err}</StatusText>}
          <Button type="submit" size="sm" data-testid="save-routine-button">
            Save routine
          </Button>
        </form>
      )}
      <Button
        variant="ghost"
        size="sm"
        data-testid="create-routine-button"
        className="mt-4 border-violet-strong"
        onClick={() => {
          setOpen((v) => !v);
          setErr('');
        }}
      >
        {open ? 'Cancel' : 'Create custom routine'}
      </Button>
    </Card>
  );
}
