'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { NovaAvatar } from '@/components/ui/misc';
import { PageContainer } from '@/components/ui/Layout';
import { PLANNED_TIME } from '@/lib/data/workouts';
import { GOAL_NAME, num } from '@/lib/format';
import { reply, THINKING_DELAY_MS } from '@/lib/reply';
import { goalPct, latestWeight, today, totals } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';

const PROMPTS = [
  'What workout should I do today?',
  'Suggest a high-protein vegetarian meal.',
  'Analyze my progress.',
  'Help me reach my fitness goal.',
];

export function CoachChat() {
  const s = useFitData();
  const pushChat = useFitStore((st) => st.pushChat);
  const [text, setText] = useState('');
  const [err, setErr] = useState(false);
  const [typing, setTyping] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(s.chat.length);

  useEffect(() => {
    if (s.chat.length === prevCount.current && !typing && !streamingText) return;
    prevCount.current = s.chat.length;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [s.chat.length, typing, streamingText]);

  const ask = (q: string) => {
    if (typing || streamingText) return;
    pushChat({ ai: false, text: q });
    setText('');
    setErr(false);
    setTyping(true);
    setAnswered(false);

    window.setTimeout(() => {
      setTyping(false);
      const fullText = reply(useFitStore.getState(), q);
      const words = fullText.split(' ');
      let wordIdx = 0;
      setStreamingText(words[0]);

      const interval = window.setInterval(() => {
        wordIdx++;
        if (wordIdx < words.length) {
          setStreamingText(words.slice(0, wordIdx + 1).join(' '));
        } else {
          window.clearInterval(interval);
          pushChat({ ai: true, text: fullText });
          setStreamingText(null);
          setAnswered(true);
        }
      }, 30);
    }, THINKING_DELAY_MS);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = text.trim();
    if (!q) {
      setErr(true);
      return;
    }
    ask(q);
  };

  const u = s.user;
  const tg = u.targets;
  const t = totals(s);
  const td = today(s);
  const wk = td.workout;
  const done = td.status === 'done' && td.session;
  const goalName = GOAL_NAME[u.goal];
  const wName = wk ? wk.name : 'Rest day';
  const wStatus = done ? `Completed · ${td.session?.minutes} min` : wk ? `Planned · ${PLANNED_TIME}` : 'Recovery';
  const wMeta = done ? `Completed · ${td.session?.minutes} min` : wk ? `${wk.exercises.length} exercises · ${wk.minutes} min` : 'Recovery day';

  return (
    <PageContainer>
      <PageHeader
        title="AI Coach"
        subtitle="Ask anything. Nova answers from your own workouts, meals and weight."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Pill>
              <Icon name="shield" size={14} className="text-lime" />
              Your data stays private
            </Pill>
            <LinkButton href="/dashboard" variant="ghost" size="sm">
              <Icon name="chevronLeft" size={16} />
              Back to dashboard
            </LinkButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        <Card
          as="section"
          aria-label="Chat with Nova"
          className="flex min-w-0 flex-col p-0 md:min-h-[720px] md:p-0 overflow-hidden"
        >
          <div className="flex items-center gap-3.5 border-b border-line px-5 py-4">
            <NovaAvatar size={44} iconSize={22} />
            <div>
              <p className="font-display text-[17px] font-bold">Nova</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-lime">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-lime" />
                </span>
                Online · knows your goal: {goalName}
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-5 overflow-y-auto" role="log" aria-live="polite" aria-label="Conversation">
            {s.chat.map((m, i) =>
              m.ai ? (
                <div key={i} className="flex items-end gap-3">
                  <NovaAvatar size={32} iconSize={16} strokeWidth={2.2} />
                  <div className="flex max-w-[580px] min-w-0 flex-col gap-2.5">
                    <p className="rounded-[20px_20px_20px_6px] border border-line bg-raised px-4 py-3.5 text-[15px] leading-[1.6] md:text-[16px]">
                      {m.text}
                    </p>
                    {m.card && (
                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-lime-line bg-lime-deep px-4 py-3.5">
                        <div>
                          <p className="text-[12px] font-bold tracking-[0.1em] text-lime">TODAY</p>
                          <p className="mt-1 font-display text-[18px] font-bold">{wName}</p>
                          <p className="mt-1 text-[13px] text-muted">{wMeta}</p>
                        </div>
                        {wk && (
                          <LinkButton href={done ? '/progress' : '/workouts/active'} size="sm">
                            {done ? 'See progress' : 'Start Workout'}
                          </LinkButton>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[460px] rounded-[20px_20px_6px_20px] bg-lime px-4 py-3.5 text-[15px] leading-normal font-medium text-on-lime md:text-[16px]">
                    {m.text}
                  </p>
                </div>
              ),
            )}

            {streamingText && (
              <div className="flex items-end gap-3">
                <NovaAvatar size={32} iconSize={16} strokeWidth={2.2} />
                <div className="flex max-w-[580px] min-w-0 flex-col gap-2.5">
                  <p className="rounded-[20px_20px_20px_6px] border border-line bg-raised px-4 py-3.5 text-[15px] leading-[1.6] md:text-[16px]">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 ml-1 bg-lime animate-pulse align-middle" />
                  </p>
                </div>
              </div>
            )}

            {typing && (
              <div className="flex items-center gap-3" role="status">
                <NovaAvatar size={32} iconSize={16} strokeWidth={2.2} />
                <div className="flex items-center gap-1.5 rounded-[20px] border border-line bg-raised px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-lime animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-lime animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-lime animate-bounce" />
                  <span className="ml-2 text-[14px] text-muted">Nova is thinking…</span>
                </div>
              </div>
            )}

            {answered && !typing && (
              <div className="flex flex-wrap gap-2.5 pl-11">
                <LinkButton href="/dashboard" size="sm">
                  Return to dashboard
                </LinkButton>
                <LinkButton href="/nutrition" variant="ghost" size="sm">
                  Open Nutrition
                </LinkButton>
                <LinkButton href="/workouts" variant="ghost" size="sm">
                  Open workouts
                </LinkButton>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div
            className={clsx(
              'flex flex-col gap-3.5 border-t border-line bg-card p-4 md:p-5',
            )}
          >
            <div className="flex gap-2.5 overflow-x-auto pb-1 md:flex-wrap">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => ask(p)}
                  disabled={typing}
                  className="h-9 flex-none rounded-full border border-line-active bg-transparent px-3.5 text-left text-[13px] font-semibold whitespace-nowrap text-chip-fg transition-colors duration-150 hover:border-lime hover:bg-chip hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={submit} noValidate className="flex flex-col gap-2">
              <div className="flex gap-3">
                <input
                  type="text"
                  aria-label="Message Nova"
                  data-testid="coach-input"
                  placeholder="Ask Nova about workouts, nutrition or your progress…"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setErr(false);
                  }}
                  disabled={typing}
                  className={clsx(
                    'h-12 flex-1 rounded-xl border bg-app px-4 text-[15px] text-fg placeholder:text-placeholder focus:border-lime focus:outline-none disabled:opacity-60',
                    err ? 'border-danger-line' : 'border-line',
                  )}
                />
                <button
                  type="submit"
                  disabled={typing}
                  aria-label="Send message"
                  data-testid="coach-send-button"
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-lime text-on-lime transition-all duration-150 hover:bg-lime-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Icon name="send" size={18} strokeWidth={2.6} />
                </button>
              </div>
              {err && (
                <p role="alert" className="text-[13px] font-medium text-danger">
                  Type a question for Nova first.
                </p>
              )}
            </form>
          </div>
        </Card>

        <aside className="flex min-w-0 flex-col gap-6">
          <Card>
            <h3 className="text-[19px] font-bold">Today&apos;s workout</h3>
            <p className="mt-1 text-[13px] text-muted">{wStatus}</p>
            <div className="mt-3 rounded-xl border border-line bg-row p-3.5">
              <p className="font-display text-[16px] font-bold">{wName}</p>
              <p className="mt-0.5 text-[13px] text-muted">{wMeta}</p>
            </div>
            {wk && (
              <LinkButton href={done ? '/workouts/details' : '/workouts/active'} variant="ghost" size="sm" className="mt-3 w-full">
                {done ? 'View workout' : 'Start today&apos;s workout'}
              </LinkButton>
            )}
          </Card>

          <Card>
            <h3 className="text-[19px] font-bold">Today&apos;s nutrition</h3>
            <p className="mt-1 text-[13px] text-muted">
              {num(t.k)} of {num(tg.kcal)} kcal · {t.p} of {tg.protein} g protein
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <div>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-semibold text-soft">Calories</span>
                  <span className="text-muted">
                    {Math.round((t.k / tg.kcal) * 100)}%
                  </span>
                </div>
                <ProgressBar value={Math.round((t.k / tg.kcal) * 100)} color="lime" label="Calories" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[13px]">
                  <span className="font-semibold text-soft">Protein</span>
                  <span className="text-muted">
                    {Math.round((t.p / tg.protein) * 100)}%
                  </span>
                </div>
                <ProgressBar value={Math.round((t.p / tg.protein) * 100)} color="violet" label="Protein" />
              </div>
            </div>
            <LinkButton href="/nutrition" variant="ghost" size="sm" className="mt-4 w-full">
              Open Nutrition
            </LinkButton>
          </Card>

          <Card>
            <h3 className="text-[19px] font-bold">Goal: {goalName}</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">
              Current: {latestWeight(s).toFixed(1)} kg → Target: {u.goalWeight} kg ({goalPct(s)}% achieved).
            </p>
            <LinkButton href="/progress" variant="ghost" size="sm" className="mt-3 w-full">
              View progress
            </LinkButton>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
