'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalorieTrend } from '@/components/charts/CalorieTrend';
import { ConsistencyBars } from '@/components/charts/ConsistencyBars';
import { StrengthRow } from '@/components/charts/StrengthRow';
import { WeightChart } from '@/components/charts/WeightChart';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Label } from '@/components/ui/Field';
import { Ring } from '@/components/ui/Ring';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Icon } from '@/components/ui/Icon';
import { InfoTip } from '@/components/ui/InfoTip';
import { NumberStat } from '@/components/ui/NumberStat';
import { PageContainer, Stack } from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { addDays, fmt, TODAY } from '@/lib/date';
import { dur, GOAL_NAME, num, signed } from '@/lib/format';
import {
  avgIntake,
  bars,
  calorieSeries,
  goalPct,
  kgToGo,
  latestWeight,
  lifts,
  stats,
  totals,
  weightDelta,
  weightSeries,
  type ChartBox,
} from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';
import { inRange, parseNum } from '@/lib/validation';

type Range = 7 | 30;

const CHART_BOX: ChartBox = { W: 760, H: 280, L: 48, R: 16, T: 20, B: 34 };
const WEIGHT_MIN = 30;
const WEIGHT_MAX = 300;

const INSIGHT_STYLES = {
  lime: { tag: 'text-lime', border: 'border-lime-line' },
  amber: { tag: 'text-amber', border: 'border-amber-line' },
  violet: { tag: 'text-violet-soft', border: 'border-violet-line' },
} as const;

export function ProgressOverview() {
  const params = useSearchParams();
  const s = useFitData();
  const logWeight = useFitStore((st) => st.logWeight);
  const [range, setRange] = useState<Range>(30);
  const [wIn, setWIn] = useState('');
  const [wErr, setWErr] = useState('');
  const [wOk, setWOk] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wantsFocus = params.get('focus') === 'weight';

  useEffect(() => {
    if (!wantsFocus) return;
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ block: 'center' });
  }, [wantsFocus]);

  const is7 = range === 7;
  const u = s.user;
  const w = latestWeight(s);
  const d = weightDelta(s, range);
  const st = stats(s, range);
  const gp = goalPct(s);
  const lf = lifts(s, range);
  const bench = lf[0];
  const avg = avgIntake(s, range);
  const pl = Math.max(0, u.targets.protein - totals(s).p);
  const series = weightSeries(s, range);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = parseNum(wIn);
    if (!inRange(v, WEIGHT_MIN, WEIGHT_MAX)) {
      setWErr(`Enter a weight between ${WEIGHT_MIN} and ${WEIGHT_MAX} kg.`);
      setWOk(false);
      return;
    }
    const prevWeight = w;
    const newWeight = +v.toFixed(1);
    logWeight(newWeight);
    showToast(`Weight saved (${newWeight} kg)`, 'success', {
      onUndo: () => {
        logWeight(prevWeight);
        showToast(`Restored weight to ${prevWeight.toFixed(1)} kg`, 'info');
      },
    });
    setWIn('');
    setWErr('');
    setWOk(true);
  };

  const statTiles = [
    { label: 'Current weight', value: w.toFixed(1), unit: 'kg', note: `${signed(d)} kg this period`, violet: false },
    {
      label: 'Workouts completed',
      value: st.done,
      unit: `of ${st.planned} planned`,
      note: st.done >= st.planned ? 'Every planned session done' : `${st.planned - st.done} to catch up`,
      violet: false,
    },
    {
      label: 'Consistency',
      value: st.pct,
      unit: '%',
      note: st.pct >= 90 ? 'Excellent consistency' : st.pct >= 75 ? 'On track' : 'Room to improve',
      violet: false,
    },
    {
      label: 'Avg protein',
      value: avg.p,
      unit: 'g / day',
      note: `${Math.round((avg.p / u.targets.protein) * 100)}% of your ${u.targets.protein} g target`,
      violet: true,
    },
  ];

  const insights = [
    {
      tone: 'lime' as const,
      tag: 'WHAT IS WORKING',
      title: 'Your lifts are climbing every week',
      body: `Bench is ${bench.to} kg, up from ${bench.from} kg. Progressive overload is doing its job.`,
    },
    {
      tone: 'amber' as const,
      tag: 'WATCH',
      title: `Protein is averaging ${Math.max(0, u.targets.protein - avg.p)} g under target`,
      body: pl > 0 ? `You are ${pl} g short today. A protein-rich dinner would close the gap.` : 'You hit your protein target today. Keep it up.',
    },
    {
      tone: 'violet' as const,
      tag: 'NEXT STEP',
      title: 'Add 2.5 kg to bench next session',
      body: "You've hit every rep at your current weight. Nova will update your plan.",
    },
  ];

  const summary = [
    { k: 'Sessions', v: `${st.done} of ${st.planned}` },
    { k: 'Avg calories', v: `${num(avg.k)} kcal` },
    { k: 'Avg protein', v: `${avg.p} g` },
    { k: 'Training time', v: dur(st.minutes) },
    { k: 'Weight change', v: `${signed(d)} kg` },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Progress"
        subtitle={`${fmt(addDays(TODAY, -(range - 1)))} – ${fmt(TODAY)} · ${GOAL_NAME[u.goal]} goal`}
        align="end"
        actions={
          <div className="flex flex-wrap items-end gap-3.5 max-md:w-full">
            <SegmentedControl<Range>
              label="Time range"
              size="md"
              track="card"
              value={range}
              onChange={setRange}
              options={[
                { value: 7, label: '7 days' },
                { value: 30, label: '30 days' },
              ]}
            />
            <form onSubmit={submit} noValidate className="flex items-end gap-2.5 max-md:w-full">
              <div className="max-md:flex-1">
                <Label htmlFor="wt" className="mb-1.5 block">
                  Log today&apos;s weight (kg)
                </Label>
                <Field
                  ref={inputRef}
                  id="wt"
                  data-testid="progress-weight-input"
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  fieldSize="sm"
                  placeholder={w.toFixed(1)}
                  value={wIn}
                  invalid={!!wErr}
                  aria-describedby={wErr ? 'wt-err' : undefined}
                  onChange={(e) => {
                    setWIn(e.target.value);
                    setWErr('');
                    setWOk(false);
                  }}
                  className="md:w-[150px]"
                />
              </div>
              <Button type="submit" data-testid="progress-weight-submit">Save</Button>
            </form>
          </div>
        }
      />

      {wErr && (
        <p id="wt-err" role="alert" className="-mt-2 text-[14px] text-danger">
          {wErr}
        </p>
      )}
      {wOk && (
        <p role="status" className="-mt-2 text-[14px] font-semibold text-lime">
          <Icon name="check" size={14} strokeWidth={2.8} className="mr-1.5 inline-block align-[-2px]" />
          Weight saved. Your chart and goal progress are updated.{' '}
          <Link href="/dashboard" className="underline">
            View dashboard
          </Link>
        </p>
      )}

      <Stack gap={24}>
        <section aria-label="Key stats" className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
          {statTiles.map((t) => (
            <Card key={t.label} className="flex min-w-0 flex-col gap-2 justify-between">
              <div>
                <p className="text-[13px] font-medium text-muted">{t.label}</p>
                <p className="mt-1 font-display text-[26px] font-extrabold md:text-[32px]">
                  {typeof t.value === 'number' ? (
                    <NumberStat value={t.value} />
                  ) : (
                    <NumberStat value={parseFloat(t.value)} decimals={1} />
                  )}{' '}
                  <span className="font-sans text-[13px] font-medium text-muted md:text-[15px]">{t.unit}</span>
                </p>
              </div>
              <p className={`text-[13px] font-semibold md:text-[14px] ${t.violet ? 'text-violet-soft' : 'text-lime'}`}>{t.note}</p>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[18px] items-stretch">
          <Card className="flex min-w-0 flex-col gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[19px] font-bold">Weight history</h3>
                <InfoTip topicId="weight-history" />
              </div>
              <p className="mt-1 text-[14px] text-muted">
                {signed(d)} kg {is7 ? 'this week' : 'in 30 days'} · steady, healthy pace
              </p>
            </div>
            <div className="min-w-0 flex-1">
              <WeightChart series={series} box={CHART_BOX} label={`Weight history line chart, latest ${w.toFixed(1)} kilograms`} />
            </div>
          </Card>

          <Card className="flex min-w-0 flex-col items-center gap-4 text-center justify-between">
            <div className="flex items-center gap-1.5 self-start">
              <h3 className="text-[19px] font-bold">Goal progress</h3>
              <InfoTip topicId="goal-progress-calc" example={`${gp}% achieved (${kgToGo(s)} kg to go)`} />
            </div>
            <Ring size={164} radius={70} stroke={14} value={gp} label={`Goal progress ${gp} percent`}>
              <p className="font-display text-[34px] font-extrabold">
                <NumberStat value={gp} suffix="%" />
              </p>
              <p className="text-[13px] font-medium text-muted">to {u.goalWeight} kg</p>
            </Ring>
            <p className="text-[15px] leading-[1.55] text-soft">
              <strong>{kgToGo(s)} kg to go.</strong> At about 0.4 kg per week you&apos;ll get there around early December.
            </p>
            <LinkButton href="/profile" variant="ghost" className="w-full">
              Edit goal
            </LinkButton>
          </Card>
        </section>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[18px] font-bold">Progress insights</h2>
            <InfoTip topicId="progress-insights" />
          </div>
          <section aria-label="AI insights" className="grid grid-cols-1 md:grid-cols-3 gap-[18px]">
            {insights.map((i) => (
              <Card key={i.tag} className={`flex min-w-0 flex-col gap-2.5 ${INSIGHT_STYLES[i.tone].border}`}>
                <p className={`text-[12px] font-bold tracking-[0.1em] ${INSIGHT_STYLES[i.tone].tag}`}>{i.tag}</p>
                <h3 className="text-[18px] leading-[1.3] font-bold">{i.title}</h3>
                <p className="text-[15px] leading-[1.55] text-muted">{i.body}</p>
              </Card>
            ))}
          </section>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] items-stretch">
          <Card className="flex min-w-0 flex-col gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[19px] font-bold">Workout consistency</h3>
                <InfoTip topicId="workout-consistency" />
              </div>
              <p className="mt-1 text-[14px] text-muted">{is7 ? 'Training minutes per day' : 'Sessions per week (target 4)'}</p>
            </div>
            <div className="min-w-0 flex-1">
              <ConsistencyBars
                data={bars(s, range)}
                label={is7 ? 'Training minutes per day for the last 7 days' : 'Sessions per week for the last 30 days'}
              />
            </div>
          </Card>

          <Card className="flex min-w-0 flex-col gap-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[19px] font-bold">Strength progress</h3>
                <InfoTip topicId="strength-progress" />
              </div>
              <p className="mt-1 text-[14px] text-muted">Top set, {is7 ? 'last 7 days' : 'last 30 days'}</p>
            </div>
            <div className="flex flex-col gap-3">
              {lf.map((l) => (
                <StrengthRow key={l.id} lift={l} />
              ))}
            </div>
          </Card>

          <Card className="flex min-w-0 flex-col justify-between">
            <div>
              <h3 className="mb-3 text-[19px] font-bold">{is7 ? 'Weekly summary' : '30-day summary'}</h3>
              <dl>
                {summary.map((r) => (
                  <div key={r.k} className="flex justify-between border-t border-line-soft py-3 first:border-t-0">
                    <dt className="text-muted">{r.k}</dt>
                    <dd className="font-bold">{r.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <LinkButton href="/coach" variant="ghost" className="mt-4 w-full">
              Ask Nova about my progress
            </LinkButton>
          </Card>
        </section>

        <Card as="section" aria-label="Calorie trend" className="flex min-w-0 flex-col gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[19px] font-bold">Calorie trend</h3>
              <InfoTip topicId="calorie-trend" example={`Average ${num(avg.k)} kcal vs target ${num(u.targets.kcal)} kcal`} />
            </div>
            <p className="mt-1 text-[14px] text-muted">
              Daily calories vs your {num(u.targets.kcal)} kcal target · average {num(avg.k)} kcal
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <CalorieTrend series={calorieSeries(s, range)} target={u.targets.kcal} />
          </div>
        </Card>
      </Stack>
    </PageContainer>
  );
}
