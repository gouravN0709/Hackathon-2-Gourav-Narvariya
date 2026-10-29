'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { OptionCard } from '@/components/features/auth/OptionCard';
import { Alert } from '@/components/ui/Alert';
import { Button, LinkButton } from '@/components/ui/Button';
import { Field, Label } from '@/components/ui/Field';
import { InfoTip } from '@/components/ui/InfoTip';
import { Spinner, SuccessCheck } from '@/components/ui/misc';
import { DIETS, EXPERIENCES, ONBOARDING_GOALS, optionTitle } from '@/lib/data/options';
import { num } from '@/lib/format';
import { calcTargets, latestWeight } from '@/lib/selectors';
import { useFitStore } from '@/lib/store';
import { inRange, parseNum } from '@/lib/validation';
import type { Diet, Experience, Goal, User } from '@/types/domain';

const STEP_NAMES = ['', 'About you', 'Your goal', 'Experience', 'Diet', 'Confirm'];
const BUILD_DELAY_MS = 1600;
type Bad = 'age' | 'height' | 'weight' | 'goal' | 'exp' | 'diet' | '';

export function OnboardingFlow() {
  const user = useFitStore((s) => s.user);
  const saveUser = useFitStore((s) => s.saveUser);

  const [step, setStep] = useState(1);
  const [age, setAge] = useState(() => String(user.age));
  const [height, setHeight] = useState(() => String(user.height));
  const [weight, setWeight] = useState(() => String(latestWeight(useFitStore.getState())));
  const [goal, setGoal] = useState<Goal | ''>('');
  const [exp, setExp] = useState<Experience | ''>('');
  const [diet, setDiet] = useState<Diet | ''>('');
  const [err, setErr] = useState('');
  const [bad, setBad] = useState<Bad>('');
  const [phase, setPhase] = useState<'flow' | 'building' | 'done'>('flow');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const a = parseNum(age);
  const h = parseNum(height);
  const w = parseNum(weight);
  const targets = calcTargets({ height: h || 0, age: a || 0, goal: goal || 'muscle' }, w || 0);

  const clear = () => {
    setErr('');
    setBad('');
  };

  const choose = <T,>(set: (value: T) => void, value: T) => {
    set(value);
    clear();
  };

  const validate = (): [Bad, string] | null => {
    if (step === 1) {
      if (!inRange(a, 14, 90)) return ['age', 'Enter an age between 14 and 90.'];
      if (!inRange(h, 120, 230)) return ['height', 'Enter a height between 120 and 230 cm.'];
      if (!inRange(w, 30, 300)) return ['weight', 'Enter a weight between 30 and 300 kg.'];
    }
    if (step === 2 && !goal) return ['goal', 'Pick a goal to continue.'];
    if (step === 3 && !exp) return ['exp', 'Pick your experience level to continue.'];
    if (step === 4 && !diet) return ['diet', 'Pick a dietary preference to continue.'];
    return null;
  };

  const next = () => {
    const v = validate();
    if (v) {
      setBad(v[0]);
      setErr(v[1]);
      return;
    }
    clear();
    if (step < 5) {
      setStep(step + 1);
      return;
    }
    if (!goal || !exp || !diet) return;
    setPhase('building');
    timer.current = window.setTimeout(() => {
      const nw = +w.toFixed(1);
      const patch: Partial<User> = { age: a, height: h, goal, exp, diet };
      if (goal !== user.goal) {
        patch.startWeight = nw;
        patch.goalWeight = goal === 'muscle' ? Math.round(nw + 3.6) : goal === 'fat' ? Math.round(nw - 5) : Math.round(nw);
      }
      saveUser(patch, targets, nw);
      setPhase('done');
    }, BUILD_DELAY_MS);
  };

  if (phase === 'building') {
    return (
      <div role="status" className="flex flex-col items-center gap-[18px] py-20 text-center">
        <Spinner />
        <h2 className="text-[24px] font-bold md:text-[28px]">Nova is building your plan…</h2>
        <p className="text-[16px] text-muted">Matching exercises, macros and meals to your answers.</p>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div role="status" className="flex flex-col items-center gap-[18px] py-6 text-center">
        <SuccessCheck />
        <h2 className="text-[28px] font-bold md:text-[34px]">Your plan is ready!</h2>
        <p className="max-w-[420px] text-[17px] leading-[1.6] text-muted">
          A 4-day split, {num(targets.kcal)} kcal and {targets.protein} g protein a day. Your dashboard is set up and Nova is
          waiting.
        </p>
        <LinkButton href="/dashboard" size="lg" className="mt-2 px-7">
          Go to my dashboard
        </LinkButton>
      </div>
    );
  }

  const numberField = (id: 'age' | 'height' | 'weight', label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <div className="flex-[1_1_140px]">
      <Label tone="strong" htmlFor={id}>
        {label}
      </Label>
      <Field
        id={id}
        data-testid={`onboarding-${id}`}
        type="number"
        inputMode={id === 'weight' ? 'decimal' : 'numeric'}
        step={id === 'weight' ? 0.1 : 1}
        placeholder={placeholder}
        value={value}
        invalid={bad === id}
        onChange={(e) => {
          set(e.target.value);
          clear();
        }}
        className="mt-2 text-[18px] font-semibold"
      />
    </div>
  );

  const heading = (title: string, sub: string, topicId?: string) => (
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-[26px] leading-[1.2] font-bold md:text-[32px]">{title}</h2>
        {topicId && <InfoTip topicId={topicId} />}
      </div>
      <p className="mt-2 text-[17px] text-muted">{sub}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[14px] font-semibold text-soft">Step {step} of 5</p>
          <p className="text-[14px] text-muted">{STEP_NAMES[step]}</p>
        </div>
        <div className="flex gap-1.5" role="img" aria-label={`Step ${step} of 5`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={clsx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-lime' : 'bg-line')} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-[22px]">
          {heading('Tell us about you', 'We use this to set your calorie and protein targets.', 'onboarding-step-1')}
          <div className="flex flex-wrap gap-4">
            {numberField('age', 'Age', age, setAge, 'years')}
            {numberField('height', 'Height', height, setHeight, 'cm')}
            {numberField('weight', 'Current weight', weight, setWeight, 'kg')}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-[22px]">
          {heading("What's your main goal?", 'Pick the one that matters most right now.', 'onboarding-step-2')}
          <div className="flex flex-col gap-3">
            {ONBOARDING_GOALS.map((o) => (
              <OptionCard key={o.id} title={o.title} desc={o.desc} on={goal === o.id} onPick={() => choose(setGoal, o.id)} />
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-[22px]">
          {heading('How experienced are you?', 'This sets exercise difficulty and weekly volume.', 'onboarding-step-3')}
          <div className="flex flex-col gap-3">
            {EXPERIENCES.map((o) => (
              <OptionCard key={o.id} title={o.title} desc={o.desc} on={exp === o.id} onPick={() => choose(setExp, o.id)} />
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-[22px]">
          {heading('How do you eat?', 'Nova will only suggest meals that match.', 'onboarding-step-4')}
          <div className="flex flex-wrap gap-3">
            {DIETS.map((o) => (
              <OptionCard
                key={o.id}
                title={o.title}
                on={diet === o.id}
                onPick={() => choose(setDiet, o.id)}
                className="w-auto flex-[1_1_240px]"
              />
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col gap-5">
          {heading(`Looks good, ${user.first}?`, 'Check your answers. Nova will build your plan from these.', 'onboarding-step-5')}
          <dl>
            {[
              ['Age', `${a} years`],
              ['Height', `${h} cm`],
              ['Current weight', `${w} kg`],
              ['Goal', optionTitle(ONBOARDING_GOALS, goal)],
              ['Experience', optionTitle(EXPERIENCES, exp)],
              ['Diet', optionTitle(DIETS, diet)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-t border-line py-3.5 text-[16px]">
                <dt className="text-muted">{k}</dt>
                <dd className="font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap justify-between gap-5 rounded-2xl border border-lime-line bg-lime-deep px-5 py-[18px]">
            <div>
              <p className="text-[13px] text-muted">Daily calories</p>
              <p className="font-display text-[26px] font-extrabold text-lime">{num(targets.kcal)}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted">Daily protein</p>
              <p className="font-display text-[26px] font-extrabold text-violet-soft">{targets.protein} g</p>
            </div>
            <div>
              <p className="text-[13px] text-muted">Training</p>
              <p className="font-display text-[26px] font-extrabold">4 days</p>
            </div>
          </div>
        </div>
      )}

      {err && <Alert tone="error">{err}</Alert>}

      <div className="mt-1 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="lg"
          data-testid="onboarding-back"
          className={clsx('px-7', step === 1 && 'invisible')}
          onClick={() => {
            setStep(Math.max(1, step - 1));
            clear();
          }}
        >
          Back
        </Button>
        <Button size="lg" className="px-7" data-testid="onboarding-continue" onClick={next}>
          {step === 5 ? 'Build my plan' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
