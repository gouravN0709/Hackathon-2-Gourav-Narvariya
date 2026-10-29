'use client';

import { useState } from 'react';
import { BackLink } from '@/components/layout/PageHeader';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, PlayIcon } from '@/components/ui/Icon';
import { InfoTip } from '@/components/ui/InfoTip';
import { Pill } from '@/components/ui/Pill';
import { EmptyState, Eyebrow, ExercisePlaceholder } from '@/components/ui/misc';
import { PageContainer, Stack } from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { fmt } from '@/lib/date';
import { EXTRA_EXERCISES, NOVA_NOTES } from '@/lib/data/workouts';
import { mmss, num, setLine } from '@/lib/format';
import { todayIndex, week, workoutExercises } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';
import type { Exercise } from '@/types/domain';

export function WorkoutDetails() {
  const s = useFitData();
  const setUI = useFitStore((st) => st.setUI);
  const [openTip, setOpenTip] = useState('');
  const [picker, setPicker] = useState(false);

  const cur = week(s)[s.ui.workoutDay ?? todayIndex()];
  const w = cur.workout;
  const extras = (w && s.ui.extras[w.key]) || [];
  const list = w ? workoutExercises(s, w.key) : [];
  const have = new Set(list.map((e) => e.id));
  const options = EXTRA_EXERCISES.filter((e) => !have.has(e.id));
  const totalSets = list.reduce((a, e) => a + e.sets, 0);
  const volume = list.reduce((a, e) => a + e.sets * e.reps * e.kg, 0);
  const prev = w
    ? s.sessions.filter((x) => x.key === w.key && x.date < cur.date).sort((a, b) => (a.date < b.date ? 1 : -1))[0]
    : undefined;
  const st = cur.status;
  const dayLabel = `${cur.dowFull}, Oct ${cur.num}${st === 'today' ? ' · Today' : ''}`;

  const add = (ex: Exercise) => {
    if (!w) return;
    setUI({ extras: { ...s.ui.extras, [w.key]: [...extras, ex] } });
    showToast(`Added ${ex.name} to ${w.name}`, 'success');
  };

  return (
    <PageContainer>
      <Stack gap={24}>
        <div>
          <BackLink href="/workouts">Back to My Workouts</BackLink>
        </div>

        <Card as="section" className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0 flex-[1_1_380px]">
            <p className="text-[13px] font-medium text-muted">{dayLabel}</p>
            <h1 className="mt-1.5 text-[30px] leading-[1.1] font-bold md:text-[40px]">{cur.name}</h1>
            {w && (
              <>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Pill>
                    <Icon name="clock" size={14} />
                    {w.minutes} min
                  </Pill>
                  <Pill>{list.length} exercises</Pill>
                  <Pill>{totalSets} sets</Pill>
                  <Pill>~{w.kcal} kcal</Pill>
                </div>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {w.focus.map((f) => (
                    <Pill key={f} tone="lime">
                      {f}
                    </Pill>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="flex flex-none flex-col items-start gap-2.5 max-md:w-full">
            {st === 'today' && (
              <LinkButton href="/workouts/active" className="h-14 px-9 text-[17px] max-md:w-full" data-testid="start-workout-button">
                <PlayIcon />
                Start Workout
              </LinkButton>
            )}
            {st === 'done' && (
              <>
                <Pill tone="lime">
                  <Icon name="check" size={13} strokeWidth={2.8} />
                  Completed · {cur.session ? `${cur.session.minutes} min` : ''}
                </Pill>
                <LinkButton href="/progress" variant="ghost">
                  See progress
                </LinkButton>
              </>
            )}
            {st === 'planned' && (
              <p className="max-w-[240px] text-[14px] leading-normal text-muted">Scheduled for {dayLabel}. You can start it on the day.</p>
            )}
            {st === 'missed' && (
              <p className="max-w-[240px] text-[14px] leading-normal text-amber">
                This session was missed. Nova moved the volume into next week.
              </p>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[22px] font-bold">Exercises</h2>
                <InfoTip topicId="sets-reps-weight-rest" />
              </div>
              {w && (
                <Button variant="ghost" size="sm" onClick={() => setPicker((v) => !v)} aria-expanded={picker} data-testid="add-exercise-button">
                  {picker ? 'Close' : '+ Add Exercise'}
                </Button>
              )}
            </div>

            {picker && w && (
              <Card className="flex flex-col gap-3">
                <p className="text-[13px] font-medium text-muted">Add an exercise to {cur.name}</p>
                <div className="flex flex-col gap-2">
                  {options.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => add(o)}
                      className="box-border flex min-h-11 w-full items-center justify-between gap-3 rounded-[14px] border border-line-chip bg-row px-4 py-3 text-left text-[15px] font-semibold text-fg transition-colors duration-150 hover:border-lime"
                    >
                      <span>
                        {o.name}{' '}
                        <span className="text-[13px] font-medium text-muted">
                          · {setLine(o, '')} · {o.muscle}
                        </span>
                      </span>
                      <span className="flex-none text-lime">+ Add</span>
                    </button>
                  ))}
                  {options.length === 0 && <p className="text-[14px] text-muted">All suggested exercises are already in this workout.</p>}
                </div>
              </Card>
            )}

            {!w && (
              <EmptyState className="px-6 py-14">
                <p className="font-display text-[20px] font-bold">Rest day</p>
                <p className="max-w-[360px] text-[15px] leading-normal text-muted">
                  Nothing planned. Pick a training day in My Workouts to see its details.
                </p>
                <LinkButton href="/workouts" variant="ghost" size="sm">
                  Back to My Workouts
                </LinkButton>
              </EmptyState>
            )}

            <div className="flex flex-col gap-3">
              {list.map((e, i) => {
                const open = openTip === e.id;
                return (
                  <div key={e.id} className="rounded-2xl border border-line bg-row px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3.5">
                      <ExercisePlaceholder size={72} iconSize={32} />
                      <div className="min-w-0 flex-[1_1_200px]">
                        <p className="text-[17px] font-bold">
                          {i + 1}. {e.name}
                        </p>
                        <p className="mt-[3px] text-[13px] text-muted">{e.muscle}</p>
                      </div>
                      <dl className="flex flex-wrap gap-4 sm:gap-6">
                        {[
                          ['Sets', e.sets],
                          ['Reps', e.reps],
                          ['Weight', e.kg ? `${e.kg} kg` : 'Bodyweight'],
                          ['Rest', mmss(e.rest)],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-[13px] font-medium text-muted">{k}</dt>
                            <dd className="mt-0.5 font-bold">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpenTip(open ? '' : e.id)}
                      aria-expanded={open}
                      className="min-h-11 py-1.5 text-[13px] font-semibold text-violet-soft transition-colors duration-150 hover:text-white md:min-h-0"
                    >
                      {open ? 'Hide form tip' : 'Show form tip'}
                    </button>
                    {open && (
                      <p className="mt-2 rounded-xl border border-violet-line bg-violet-tint px-3.5 py-2.5 text-[14px] leading-[1.55] text-violet-text">
                        {e.tip}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-6">
            <Card>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[19px] font-bold">Session estimate</h3>
                <InfoTip topicId="session-estimate" example={`Planned volume: ${num(volume)} kg`} />
              </div>
              <dl className="mt-3 flex flex-col">
                {[
                  ['Planned volume', `${num(volume)} kg`],
                  ['Longest rest', list.length ? mmss(Math.max(...list.map((e) => e.rest))) : '–'],
                  ['Last time', prev ? `${fmt(prev.date)} · ${prev.minutes} min` : 'First time'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-t border-line-soft py-3 first:border-t-0 first:pt-0">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
            <Card tone="ai">
              <div className="flex items-center gap-1.5">
                <Eyebrow tone="violet">Notes from Nova</Eyebrow>
                <InfoTip topicId="nova-notes" />
              </div>
              <p className="mt-2.5 text-[15px] leading-[1.6]">
                {w ? NOVA_NOTES[w.key] : 'Rest and recover. Nova will adjust the plan if you skip a day.'}
              </p>
              <LinkButton href="/coach" variant="ghost" size="sm" className="mt-4">
                Ask Nova about this workout
              </LinkButton>
            </Card>
          </aside>
        </div>
      </Stack>
    </PageContainer>
  );
}
