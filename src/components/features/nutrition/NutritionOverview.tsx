'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { ProgressBar, type BarColor } from '@/components/ui/ProgressBar';
import { Ring } from '@/components/ui/Ring';
import { EmptyState, NovaAvatar } from '@/components/ui/misc';
import { NumberStat } from '@/components/ui/NumberStat';
import { PageContainer, Stack } from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { fmtFull, TODAY } from '@/lib/date';
import { SUGGESTED_MEAL } from '@/lib/data/foods';
import { DIET_NAME, MEAL_NAME, num } from '@/lib/format';
import { totals } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';
import type { FoodEntry, MealKey } from '@/types/domain';

const TOAST_MS = 4000;

const MEALS: { key: MealKey; name: string; time: string; hint: string }[] = [
  { key: 'breakfast', name: 'Breakfast', time: '8:15 AM', hint: 'Start the day with 30 g of protein. Search for a food to add it.' },
  { key: 'lunch', name: 'Lunch', time: '1:10 PM', hint: 'Nothing logged for lunch yet.' },
  {
    key: 'dinner',
    name: 'Dinner',
    time: 'Planned around 8:00 PM',
    hint: "You have room for a full dinner. Try Nova's paneer tikka bowl or search for something you like.",
  },
  { key: 'snacks', name: 'Snacks', time: 'Anytime', hint: 'Snacks are a quick way to add protein. Try a shake or yogurt.' },
];

const bar = (v: number, t: number) => (t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0);

export function NutritionOverview() {
  const s = useFitData();
  const addFood = useFitStore((st) => st.addFood);
  const removeFood = useFitStore((st) => st.removeFood);
  const takeFlash = useFitStore((st) => st.takeFlash);
  const [toast, setToast] = useState(() => useFitStore.getState().ui.flash);

  useEffect(() => {
    takeFlash();
  }, [takeFlash]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(''), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  const tg = s.user.targets;
  const t = totals(s);
  const left = Math.max(0, tg.kcal - t.k);
  const protLeft = Math.max(0, tg.protein - t.p);
  const suggestionAdded = s.meals.dinner.some((it) => it.name === SUGGESTED_MEAL.name);

  const macros: { name: string; val: string; pct: number; color: BarColor; swatch: string }[] = [
    { name: 'Protein', val: `${t.p} / ${tg.protein} g`, pct: bar(t.p, tg.protein), color: 'lime', swatch: 'bg-lime' },
    { name: 'Carbs', val: `${t.c} / ${tg.carbs} g`, pct: bar(t.c, tg.carbs), color: 'violet', swatch: 'bg-violet' },
    { name: 'Fats', val: `${t.f} / ${tg.fats} g`, pct: bar(t.f, tg.fats), color: 'amber', swatch: 'bg-amber' },
  ];

  const addSuggestion = () => {
    const item = { ...SUGGESTED_MEAL };
    addFood('dinner', item);
    showToast(`Added ${item.name} to Dinner`, 'success', {
      onUndo: () => {
        const currentItems = useFitStore.getState().meals.dinner;
        const idx = currentItems.findIndex((x) => x.name === item.name);
        if (idx !== -1) {
          removeFood('dinner', idx);
          showToast(`Removed ${item.name} from Dinner`, 'info');
        }
      },
    });
  };

  const handleRemove = (meal: MealKey, index: number, item: FoodEntry) => {
    removeFood(meal, index);
    showToast(`Removed ${item.name}`, 'info', {
      onUndo: () => {
        addFood(meal, item);
        showToast(`Restored ${item.name} to ${MEAL_NAME[meal]}`, 'success');
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Nutrition"
        subtitle={`${fmtFull(TODAY)} · ${DIET_NAME[s.user.diet]} · Target ${num(tg.kcal)} kcal`}
        actions={
          <div className="flex flex-wrap items-center gap-3 max-md:w-full">
            <LinkButton href="/nutrition/add?tab=custom&meal=dinner" variant="ghost" className="max-md:flex-1">
              Add Custom Food
            </LinkButton>
            <LinkButton href="/nutrition/add" className="max-md:flex-1">
              <Icon name="search" size={16} strokeWidth={2.2} />
              Search Food
            </LinkButton>
          </div>
        }
      />

      {toast && (
        <p role="status" className="rounded-[14px] border border-lime-pill-line bg-lime-pill px-[18px] py-3 text-[15px] font-semibold text-lime">
          <Icon name="check" size={15} strokeWidth={2.8} className="mr-2 inline-block align-[-2px]" />
          {toast}
        </p>
      )}

      <Stack gap={24}>
        <section aria-label="Daily summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px] items-stretch">
          <Card className="flex min-w-0 flex-col sm:flex-row items-center gap-6 justify-between">
            <Ring size={132} radius={56} stroke={12} value={bar(t.k, tg.kcal)} label={`Calories ${bar(t.k, tg.kcal)} percent of target`}>
              <p className="font-display text-[26px] font-extrabold">
                <NumberStat value={t.k} />
              </p>
              <p className="text-[13px] font-medium text-muted">of {num(tg.kcal)}</p>
            </Ring>
            <div className="flex flex-col gap-3.5">
              <div>
                <p className="text-[13px] font-medium text-muted">Remaining calories</p>
                <p className="font-display text-[28px] font-extrabold text-lime">
                  <NumberStat value={left} /> <span className="font-sans text-[15px] font-medium text-muted">kcal</span>
                </p>
              </div>
              <div>
                <p className="text-[13px] font-medium text-muted">Remaining protein</p>
                <p className="font-display text-[28px] font-extrabold text-violet-soft">
                  <NumberStat value={protLeft} /> <span className="font-sans text-[15px] font-medium text-muted">g</span>
                </p>
              </div>
            </div>
          </Card>

          <Card className="flex min-w-0 flex-col justify-center gap-4">
            <h3 className="text-[18px] font-bold">Macros</h3>
            <div className="flex flex-col gap-3.5">
              {macros.map((m) => (
                <div key={m.name}>
                  <div className="mb-1.5 flex justify-between text-[14px]">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className={clsx('h-2.5 w-2.5 rounded-[3px]', m.swatch)} aria-hidden="true" />
                      {m.name}
                    </span>
                    <span className="text-muted">{m.val}</span>
                  </div>
                  <ProgressBar value={m.pct} color={m.color} label={`${m.name} ${m.pct} percent of target`} />
                </div>
              ))}
            </div>
          </Card>

          <Card tone="ai" className="flex min-w-0 flex-col justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <NovaAvatar size={34} iconSize={18} strokeWidth={2.2} />
                <p className="text-[12px] font-bold tracking-[0.1em] text-violet-soft">AI MEAL SUGGESTION</p>
              </div>
              <h3 className="text-[20px] font-bold">Paneer tikka bowl for dinner</h3>
              <p className="text-[14px] leading-[1.55] text-muted">
                Fits your remaining {num(left)} kcal and closes {Math.min(SUGGESTED_MEAL.p, protLeft)} g of your {protLeft} g protein gap.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Pill>{SUGGESTED_MEAL.k} kcal</Pill>
                <Pill tone="violet">{SUGGESTED_MEAL.p} g protein</Pill>
              </div>
            </div>
            <Button size="sm" onClick={addSuggestion} disabled={suggestionAdded} data-testid="add-suggestion-button">
              {suggestionAdded ? 'Added to Dinner' : 'Add to Dinner'}
            </Button>
          </Card>
        </section>

        <div className="flex flex-col gap-4">
          <h2 className="text-[22px] font-bold">Today&apos;s food log</h2>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] items-start">
            {MEALS.map((d) => {
              const items = s.meals[d.key];
              const k = items.reduce((a, it) => a + it.k, 0);
              const p = items.reduce((a, it) => a + it.p, 0);
              return (
                <Card key={d.key} as="section" aria-label={d.name} className="min-w-0 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line pb-3">
                    <div>
                      <h3 className="text-[18px] font-bold">{d.name}</h3>
                      <p className="mt-0.5 text-[13px] text-muted">{d.time}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Pill>{num(k)} kcal</Pill>
                      <Pill tone="violet">{p} g protein</Pill>
                      <LinkButton href={`/nutrition/add?meal=${d.key}`} variant="ghost" size="sm" aria-label={`Add food to ${d.name}`}>
                        + Add
                      </LinkButton>
                    </div>
                  </div>
                  {items.map((it, i) => (
                    <div key={`${it.name}-${i}`} className="flex items-center gap-3.5 py-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-semibold">{it.name}</p>
                        <p className="mt-0.5 text-[13px] text-muted">{it.serving}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold whitespace-nowrap">{num(it.k)} kcal</p>
                        <p className="mt-0.5 text-[13px] whitespace-nowrap text-violet-soft">{it.p} g protein</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(d.key, i, it)}
                        aria-label={`Remove ${it.name}`}
                        className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-placeholder transition-colors duration-150 hover:bg-danger-bg hover:text-danger"
                      >
                        <Icon name="close" size={18} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <EmptyState className="gap-2 px-4 py-6">
                      <p className="text-[16px] font-bold">Nothing logged yet</p>
                      <p className="max-w-[340px] text-[14px] leading-normal text-muted">{d.hint}</p>
                    </EmptyState>
                  )}
                </Card>
              );
            })}
          </section>
        </div>
      </Stack>
    </PageContainer>
  );
}
