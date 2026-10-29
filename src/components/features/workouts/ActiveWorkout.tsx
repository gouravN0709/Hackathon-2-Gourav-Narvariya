'use client';

import clsx from 'clsx';
import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import {
  activeReducer,
  initActive,
  isExerciseDone,
  summarize,
  topLifts,
  type ActiveExercise,
  type SetState,
} from '@/components/features/workouts/activeWorkout';
import { Alert } from '@/components/ui/Alert';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { ExercisePlaceholder, StepButton, SuccessCheck } from '@/components/ui/misc';
import { NumberStat } from '@/components/ui/NumberStat';
import { Ring } from '@/components/ui/Ring';
import { playSuccess, playTick, triggerHaptic } from '@/lib/audio';
import { mmss, num } from '@/lib/format';
import { today, workoutExercises } from '@/lib/selectors';
import { useFitStore } from '@/lib/store';

type Phase = 'rest' | 'already' | 'active' | 'saving' | 'saved';
const SAVE_DELAY_MS = 1100;

export function ActiveWorkout() {
  const saveSession = useFitStore((s) => s.saveSession);
  const first = useFitStore((s) => s.user.first);
  const sessions = useFitStore((s) => s.sessions);

  const [setup] = useState(() => {
    const s = useFitStore.getState();
    const td = today(s);
    const w = td.workout;
    return {
      workout: w,
      phase: (!w ? 'rest' : td.status === 'done' ? 'already' : 'active') as Phase,
      list: w ? workoutExercises(s, w.key) : [],
    };
  });
  const [phase, setPhase] = useState<Phase>(setup.phase);
  const [state, dispatch] = useReducer(activeReducer, setup.list, (list) => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('fitai.activeWorkout');
        if (raw) {
          const parsed = JSON.parse(raw);
          const td = today(useFitStore.getState());
          if (parsed.date === td.date && parsed.workoutKey === setup.workout?.key && parsed.state) {
            return parsed.state;
          }
        }
      } catch {}
    }
    return initActive(list);
  });
  const [elapsed, setElapsed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('fitai.activeWorkout');
        if (raw) {
          const parsed = JSON.parse(raw);
          const td = today(useFitStore.getState());
          if (parsed.date === td.date && parsed.workoutKey === setup.workout?.key && typeof parsed.elapsed === 'number') {
            return parsed.elapsed;
          }
        }
      } catch {}
    }
    return 0;
  });
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('fitai.activeWorkout');
        if (raw) {
          const parsed = JSON.parse(raw);
          const td = today(useFitStore.getState());
          if (parsed.date === td.date && parsed.workoutKey === setup.workout?.key && typeof parsed.restTimeLeft === 'number') {
            return parsed.restTimeLeft;
          }
        }
      } catch {}
    }
    return null;
  });
  const [result, setResult] = useState('');
  const saveTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (phase === 'active' && setup.workout) {
      try {
        localStorage.setItem(
          'fitai.activeWorkout',
          JSON.stringify({
            date: today(useFitStore.getState()).date,
            workoutKey: setup.workout.key,
            state,
            elapsed,
            restTimeLeft,
            savedAt: Date.now(),
          })
        );
      } catch {}
    }
  }, [phase, setup.workout, state, elapsed, restTimeLeft]);

  useEffect(() => {
    if (phase === 'already' || phase === 'saved') {
      try {
        localStorage.removeItem('fitai.activeWorkout');
      } catch {}
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'active') return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (restTimeLeft == null || restTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev == null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [restTimeLeft]);

  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const w = setup.workout;
  const { setsDone, setsTotal, volume } = summarize(state);
  const ei = Math.min(state.idx, Math.max(0, state.exercises.length - 1));
  const cur = state.exercises[ei];
  const active = phase === 'active' || phase === 'saving';
  const todaySession = sessions.find((x) => x.date === today(useFitStore.getState()).date);

  const save = () => {
    if (phase !== 'active' || !w) return;
    if (setsDone < 1) {
      dispatch({ type: 'error', message: 'Complete at least one set before saving your session.' });
      return;
    }
    const minutes = Math.max(Math.round(elapsed / 60), Math.round(w.minutes * (setsDone / setsTotal)), 1);
    const tops = topLifts(state);
    setPhase('saving');
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.removeItem('fitai.activeWorkout');
      } catch {}
      saveSession(w.key, minutes, volume, tops);
      playSuccess();
      triggerHaptic([30, 50, 60]);
      setResult(`${setsDone} ${setsDone === 1 ? 'set' : 'sets'}, ${num(volume)} kg total volume in ${minutes} min.`);
      setPhase('saved');
    }, SAVE_DELAY_MS);
  };

  const kicker = phase === 'saved' ? 'WORKOUT COMPLETE' : phase === 'already' ? 'ALREADY DONE' : 'WORKOUT IN PROGRESS';
  const saveLabel = phase === 'saving' ? 'Saving…' : 'Finish & save';

  return (
    <div className={clsx('box-border min-h-dvh bg-app px-5 pt-6 md:px-6 md:pt-8 lg:px-10', active ? 'pb-36' : 'pb-14')}>
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <LinkButton href="/workouts/details" variant="ghost" size="icon" aria-label="Back to workout details">
              <Icon name="chevronLeft" size={20} />
            </LinkButton>
            <div>
              <p className="text-[12px] font-bold tracking-[0.1em] text-lime">{kicker}</p>
              <h1 className="mt-0.5 text-[24px] font-bold md:text-[28px]">{w ? w.name : 'Rest day'}</h1>
            </div>
          </div>
          {active && (
            <div className="hidden flex-wrap items-center gap-3 md:flex">
              <SessionPills clock={mmss(elapsed)} setsDone={setsDone} setsTotal={setsTotal} volume={volume} />
              <Button onClick={save} disabled={phase === 'saving'} data-testid="active-finish-save-button">
                {saveLabel}
              </Button>
            </div>
          )}
        </header>

        {active && (
          <div className="flex gap-2" role="img" aria-label={`Workout progress: ${setsDone} of ${setsTotal} sets done`}>
            {state.exercises.map((e, i) => (
              <div
                key={e.id}
                className={clsx('h-2 flex-1 rounded-full transition-colors duration-200', isExerciseDone(e) ? 'bg-lime' : i === ei ? 'bg-lime-dim' : 'bg-line')}
              />
            ))}
          </div>
        )}

        {phase === 'saved' && (
          <Card as="section" tone="success" role="status" className="relative flex flex-col items-center gap-4 overflow-hidden px-6 py-12 text-center md:px-8 md:py-14">
            <div className="relative">
              <SuccessCheck size={72} iconSize={36} />
              <ParticleBurst />
            </div>
            <h2 className="text-[26px] font-bold md:text-[32px]">Session saved. Nice work, {first}!</h2>
            <p className="max-w-[540px] text-[17px] leading-[1.55] text-muted">{result} Your dashboard and progress are already updated.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <LinkButton href="/dashboard">Back to dashboard</LinkButton>
              <LinkButton href="/progress" variant="ghost">
                See progress
              </LinkButton>
              <LinkButton href="/nutrition/add" variant="ghost">
                Log post-workout meal
              </LinkButton>
            </div>
          </Card>
        )}

        {phase === 'already' && (
          <Card as="section" className="flex flex-col items-center gap-3.5 px-6 py-12 text-center md:px-8">
            <h2 className="text-[24px] font-bold md:text-[28px]">Today&apos;s workout is already complete</h2>
            <p className="max-w-[480px] text-[16px] leading-[1.55] text-muted">
              {todaySession ? `${todaySession.name} · ${todaySession.minutes} min · ${num(todaySession.volume)} kg volume. ` : ''}
              Rest up, refuel and Nova will have tomorrow&apos;s plan ready.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <LinkButton href="/dashboard">Back to dashboard</LinkButton>
              <LinkButton href="/progress" variant="ghost">
                See progress
              </LinkButton>
            </div>
          </Card>
        )}

        {phase === 'rest' && (
          <Card as="section" className="flex flex-col items-center gap-3.5 px-6 py-12 text-center md:px-8">
            <h2 className="text-[24px] font-bold md:text-[28px]">No workout scheduled today</h2>
            <p className="max-w-[460px] text-[16px] leading-[1.55] text-muted">Today is a rest day. Check the planner for your next session.</p>
            <LinkButton href="/workouts">Open My Workouts</LinkButton>
          </Card>
        )}

        {active && cur && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
            <Card as="nav" aria-label="Exercises" className="flex min-w-0 gap-2 overflow-x-auto p-2.5 lg:flex-col lg:p-3.5">
              {state.exercises.map((e, i) => (
                <RailItem key={e.id} ex={e} on={i === ei} onPick={() => dispatch({ type: 'select', idx: i })} />
              ))}
            </Card>

            <Card as="section" aria-label="Current exercise" className="flex min-w-0 flex-col gap-6">
              <div className="flex flex-wrap items-center gap-5">
                <ExercisePlaceholder iconSize={60} strokeWidth={1.4} className="h-24 w-24 md:h-[120px] md:w-[120px]" />
                <div className="min-w-0 flex-[1_1_260px]">
                  <p className="text-[13px] font-medium text-muted">
                    Exercise {ei + 1} of {state.exercises.length} · {cur.muscle}
                  </p>
                  <h2 className="mt-1 text-[26px] font-bold md:text-[32px]">{cur.name}</h2>
                  <p className="mt-1.5 text-[16px] text-muted">
                    Target: {cur.targetLine} · Rest {mmss(cur.rest)}
                  </p>
                  <div className="mt-3 w-fit max-w-full rounded-xl border border-violet-line bg-violet-tint px-3.5 py-2.5">
                    <span className="text-[14px] font-semibold text-violet-soft">Nova: {cur.tip}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {cur.sets.map((x, si) => (
                  <SetRow
                    key={si}
                    n={si + 1}
                    set={x}
                    planKg={cur.planKg}
                    onKg={(delta) => dispatch({ type: 'patch', ei, si, patch: { kg: Math.max(0, +(x.kg + delta * cur.step).toFixed(1)) } })}
                    onReps={(delta) => dispatch({ type: 'patch', ei, si, patch: { reps: Math.max(0, x.reps + delta) } })}
                    onToggle={() => {
                      const isCurrentlyDone = x.done;
                      dispatch({ type: 'toggle', ei, si });
                      if (!isCurrentlyDone) {
                        playTick();
                        triggerHaptic(20);
                        setRestTimeLeft(cur.rest);
                      } else {
                        playTick();
                      }
                    }}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="active-add-set-button"
                  onClick={() => dispatch({ type: 'addSet', ei })}
                >
                  + Add set
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="active-complete-exercise-button"
                  onClick={() => dispatch({ type: 'complete', ei })}
                >
                  Complete exercise
                </Button>
              </div>

              {restTimeLeft != null && restTimeLeft > 0 && (
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-lime-line bg-lime-tint p-4">
                  <div className="flex items-center gap-3.5">
                    <Ring
                      size={52}
                      radius={22}
                      stroke={5}
                      value={Math.round(((cur.rest - restTimeLeft) / cur.rest) * 100)}
                      label="Rest timer"
                    >
                      <span className="font-display text-[12px] font-bold">{restTimeLeft}s</span>
                    </Ring>
                    <div>
                      <p className="text-[14px] font-bold text-lime">Rest timer counting down</p>
                      <p className="text-[12px] text-muted">
                        Catch your breath before set {cur.sets.findIndex((s) => !s.done) + 1 || cur.sets.length}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setRestTimeLeft(null)}>
                    Skip rest
                  </Button>
                </div>
              )}

              {state.err && <Alert tone="error">{state.err}</Alert>}
            </Card>
          </div>
        )}
      </div>

      {active && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 px-5 py-3.5 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-[16px] font-bold">{mmss(elapsed)}</p>
              <p className="truncate text-[12px] text-muted">
                {setsDone}/{setsTotal} sets · <NumberStat value={volume} suffix=" kg" />
              </p>
            </div>
            <Button onClick={save} disabled={phase === 'saving'} className="min-w-[140px]">
              {saveLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionPills({ clock, setsDone, setsTotal, volume }: { clock: string; setsDone: number; setsTotal: number; volume: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Pill>
        <Icon name="clock" size={14} />
        {clock}
      </Pill>
      <Pill>
        {setsDone} of {setsTotal} sets
      </Pill>
      <Pill>
        <NumberStat value={volume} suffix=" kg volume" />
      </Pill>
    </div>
  );
}

function RailItem({ ex, on, onPick }: { ex: ActiveExercise; on: boolean; onPick: () => void }) {
  const done = isExerciseDone(ex);
  const n = ex.sets.filter((x) => x.done).length;
  return (
    <button
      type="button"
      onClick={onPick}
      aria-current={on ? 'step' : undefined}
      className={clsx(
        'box-border flex flex-none items-center gap-3 rounded-[14px] border px-3.5 py-3 text-left text-[15px] font-semibold text-fg transition-colors duration-150 max-lg:w-[220px] lg:w-full',
        on ? 'border-lime-line bg-lime-tint' : 'border-transparent hover:bg-raised',
      )}
    >
      <span
        className={clsx(
          'flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 text-on-lime',
          done ? 'border-lime bg-lime' : on ? 'border-lime' : 'border-line-mute',
        )}
      >
        {done && <Icon name="check" size={14} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate leading-tight">{ex.name}</span>
        <span className="mt-0.5 block text-[12px] leading-tight font-medium text-muted">
          {done ? `Done · ${ex.sets.length} sets` : `${n} of ${ex.sets.length} sets`}
        </span>
      </span>
    </button>
  );
}

function Stepper({ value, unit, onDown, onUp, label, wide }: { value: ReactNode; unit: string; onDown: () => void; onUp: () => void; label: string; wide: boolean }) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <StepButton onClick={onDown} label={`Decrease ${label}`}>
        −
      </StepButton>
      <div className={clsx('text-center', wide ? 'min-w-14 md:min-w-[80px]' : 'min-w-12 md:min-w-16')}>
        <p className="font-display text-[22px] font-bold">{value}</p>
        <p className="text-[13px] font-medium text-muted">{unit}</p>
      </div>
      <StepButton onClick={onUp} label={`Increase ${label}`}>
        +
      </StepButton>
    </div>
  );
}

function SetRow({
  n,
  set,
  planKg,
  onKg,
  onReps,
  onToggle,
}: {
  n: number;
  set: SetState;
  planKg: number;
  onKg: (delta: number) => void;
  onReps: (delta: number) => void;
  onToggle: () => void;
}) {
  return (
    <div
      className={clsx(
        'grid grid-cols-[1fr_auto] min-h-[64px] items-center gap-x-3 gap-y-3 rounded-2xl border px-3.5 py-3.5 md:flex md:flex-wrap md:gap-x-6 md:gap-y-3.5 md:px-5',
        set.done ? 'border-lime-line bg-lime-select' : 'border-line bg-row',
      )}
    >
      <div className="md:w-[84px]">
        <p className="text-[14px] font-semibold text-fg">Set {n}</p>
        <p className="mt-0.5 text-[12px] text-muted">Plan {planKg ? `${planKg} kg` : 'bodyweight'}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Mark set ${n} complete`}
        aria-pressed={set.done}
        className={clsx(
          'flex h-[48px] w-[48px] flex-none items-center justify-center rounded-full border-2 text-on-lime transition-all duration-200 ease-out active:scale-90 md:order-last md:ml-auto',
          set.done ? 'border-lime bg-lime scale-105 shadow-[0_0_12px_rgba(198,255,61,0.25)]' : 'border-line-mute bg-transparent hover:border-lime',
        )}
      >
        {set.done && <Icon name="check" size={24} strokeWidth={2.8} />}
      </button>
      <div className="col-span-2 flex justify-between gap-3 md:contents">
        <Stepper value={set.kg === 0 ? 'BW' : set.kg} unit="kg" label={`weight for set ${n}`} onDown={() => onKg(-1)} onUp={() => onKg(1)} wide />
        <Stepper value={set.reps} unit="reps" label={`reps for set ${n}`} onDown={() => onReps(-1)} onUp={() => onReps(1)} wide={false} />
      </div>
    </div>
  );
}

function ParticleBurst() {
  const particles = [
    { x: -50, y: -45, s: 7, d: 0 },
    { x: 50, y: -45, s: 6, d: 50 },
    { x: -70, y: 0, s: 8, d: 20 },
    { x: 70, y: 5, s: 7, d: 70 },
    { x: -40, y: 50, s: 6, d: 40 },
    { x: 45, y: 45, s: 8, d: 90 },
    { x: 0, y: -65, s: 7, d: 30 },
    { x: 0, y: 65, s: 6, d: 80 },
    { x: -60, y: -25, s: 5, d: 60 },
    { x: 60, y: -25, s: 7, d: 10 },
    { x: -30, y: -55, s: 6, d: 40 },
    { x: 30, y: -55, s: 5, d: 80 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle-burst absolute rounded-full bg-lime shadow-[0_0_8px_#c6ff3d]"
          style={{
            width: p.s,
            height: p.s,
            '--dx': `${p.x}px`,
            '--dy': `${p.y}px`,
            animationDelay: `${p.d}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
