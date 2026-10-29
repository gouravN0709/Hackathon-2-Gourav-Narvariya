'use client';

import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { BackLink, PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card, cardClass } from '@/components/ui/Card';
import { Field, Label } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Chip, EmptyState, StepButton, SuccessCheck } from '@/components/ui/misc';
import { PageContainer, Stack } from '@/components/ui/Layout';
import { showToast } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { DEFAULT_FOOD_ID, FOOD_CATEGORIES, FOODS } from '@/lib/data/foods';
import { MEAL_KEYS, MEAL_NAME, num } from '@/lib/format';
import { totals } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';
import type { FoodEntry, MealKey } from '@/types/domain';

type Tab = 'search' | 'custom';
type Category = (typeof FOOD_CATEGORIES)[number];

const QTY_MIN = 0.5;
const QTY_MAX = 8;
const QTY_STEP = 0.5;
const MOBILE_QUERY = '(max-width: 819px)';

const isMeal = (v: string | null): v is MealKey => !!v && (MEAL_KEYS as readonly string[]).includes(v);

interface CustomDraft {
  name: string;
  serving: string;
  k: string;
  p: string;
  c: string;
  f: string;
}

const EMPTY_DRAFT: CustomDraft = { name: '', serving: '', k: '', p: '', c: '', f: '' };
const defaultIdx = (id: string) => FOODS.find((f) => f.id === id)?.defIdx ?? 0;

export function FoodSearch() {
  const params = useSearchParams();
  const s = useFitData();
  const addFood = useFitStore((st) => st.addFood);

  const [tab, setTab] = useState<Tab>(() => (params.get('tab') === 'custom' ? 'custom' : 'search'));
  const [meal, setMeal] = useState<MealKey>(() => {
    const q = params.get('meal');
    return isMeal(q) ? q : useFitStore.getState().ui.meal;
  });
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category>('All');
  const [sel, setSel] = useState(DEFAULT_FOOD_ID);
  const [svIdx, setSvIdx] = useState(() => defaultIdx(DEFAULT_FOOD_ID));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState('');
  const [err, setErr] = useState('');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [draft, setDraft] = useState<CustomDraft>(EMPTY_DRAFT);
  const detailsRef = useRef<HTMLElement>(null);

  const tg = s.user.targets;
  const t = totals(s);
  const q = query.trim().toLowerCase();
  const list = FOODS.filter((f) => (cat === 'All' || f.cat === cat) && (!q || f.name.toLowerCase().includes(q)));
  const food = FOODS.find((f) => f.id === sel);
  const servings = food?.servings ?? [];
  const sv = servings[Math.min(svIdx, servings.length - 1)] ?? { label: '', m: 1 };
  const mult = sv.m * qty;
  const n = food
    ? { k: Math.round(food.k * mult), p: Math.round(food.p * mult), c: Math.round(food.c * mult), f: Math.round(food.f * mult) }
    : { k: 0, p: 0, c: 0, f: 0 };
  const nk = t.k + n.k;
  const np = t.p + n.p;
  const afterNote =
    nk > tg.kcal ? 'That puts you over your calorie target.' : np >= tg.protein ? 'That hits your protein target.' : `${num(tg.kcal - nk)} kcal still available.`;
  const resultsLabel = q || cat !== 'All' ? `${list.length} result${list.length === 1 ? '' : 's'}` : 'Frequent foods';

  const finish = (item: FoodEntry) => {
    addFood(meal, item);
    setMobileSheetOpen(false);
    showToast(`Added ${item.name} to ${MEAL_NAME[meal]}`, 'success', {
      onUndo: () => {
        const currentItems = useFitStore.getState().meals[meal];
        const idx = currentItems.findIndex((x) => x.name === item.name);
        if (idx !== -1) {
          useFitStore.getState().removeFood(meal, idx);
          showToast(`Removed ${item.name} from ${MEAL_NAME[meal]}`, 'info');
        }
      },
    });
    setAdded(`Added ${item.name} to ${MEAL_NAME[meal]}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pick = (id: string) => {
    setSel(id);
    setSvIdx(defaultIdx(id));
    setQty(1);
    setAdded('');
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setMobileSheetOpen(true);
    } else {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const addSelected = () => {
    if (!food) return;
    const label = `${qty === 1 ? '' : `${qty} × `}${sv.label}`;
    finish({ name: food.name, serving: label, k: n.k, p: n.p, c: n.c, f: n.f });
  };

  const changeTab = (t: Tab) => {
    setTab(t);
    setAdded('');
    setErr('');
  };

  const addCustom = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) {
      setErr('Give the food a name.');
      return;
    }
    const k = Number.parseFloat(draft.k);
    if (!(k > 0)) {
      setErr('Enter calories as a number above 0.');
      return;
    }
    const macro = (v: string) => Math.max(0, Math.round(Number.parseFloat(v) || 0));
    finish({
      name: draft.name.trim(),
      serving: draft.serving.trim() || '1 serving',
      k: Math.round(k),
      p: macro(draft.p),
      c: macro(draft.c),
      f: macro(draft.f),
    });
    setDraft(EMPTY_DRAFT);
  };

  const another = () => {
    setAdded('');
    setQuery('');
    setQty(1);
    setErr('');
  };

  const editDraft = (key: keyof CustomDraft, clearsError: boolean) => (e: ChangeEvent<HTMLInputElement>) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }));
    if (clearsError) setErr('');
  };

  const mealChips = (
    <div>
      <p className="mb-2 text-[13px] font-medium text-muted">Add to meal</p>
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Meal">
        {MEAL_KEYS.map((k) => (
          <Chip key={k} on={meal === k} onClick={() => setMeal(k)}>
            {MEAL_NAME[k]}
          </Chip>
        ))}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <Stack gap={24}>
        <div>
          <BackLink href="/nutrition">Back to Nutrition</BackLink>
        </div>

        <PageHeader
          title="Add food"
          subtitle="Search, pick a serving and add it to a meal in three taps."
          actions={
            <SegmentedControl<Tab>
              label="Mode"
              size="lg"
              track="card"
              value={tab}
              onChange={changeTab}
              options={[
                { value: 'search', label: 'Search foods' },
                { value: 'custom', label: 'Custom food' },
              ]}
            />
          }
        />

        {added && (
          <Card as="section" tone="success" role="status" className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <SuccessCheck size={44} iconSize={22} />
              <div>
                <p className="font-display text-[18px] font-bold">{added}</p>
                <p className="mt-1 text-[14px] text-muted">Your calories, protein and dashboard are updated.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button variant="ghost" onClick={another}>
                Add another
              </Button>
              <LinkButton href="/nutrition">Back to Nutrition</LinkButton>
              <LinkButton href="/dashboard" variant="ghost">
                Dashboard
              </LinkButton>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {tab === 'search' && (
            <>
              <section aria-label="Search results" className="flex min-w-0 flex-col gap-4">
                <Field
                  type="search"
                  aria-label="Search foods"
                  data-testid="food-search-input"
                  placeholder="Search foods, e.g. rajma, quinoa, paneer"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  fieldSize="lg"
                  className="placeholder:text-placeholder"
                />
                <div className="flex flex-wrap gap-2.5" role="group" aria-label="Category">
                  {FOOD_CATEGORIES.map((c) => (
                    <Chip key={c} on={cat === c} onClick={() => setCat(c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
                <p className="text-[13px] font-medium text-muted" aria-live="polite">
                  {resultsLabel}
                </p>
                <div className="flex flex-col gap-2.5">
                  {list.map((f) => {
                    const on = sel === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => pick(f.id)}
                        aria-pressed={on}
                        className={clsx(
                          'box-border flex w-full items-center gap-3.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-fg transition-colors duration-150',
                          on ? 'border-lime bg-lime-select' : 'border-line bg-card hover:border-line-hover hover:bg-row-hover',
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-bold">{f.name}</span>
                          <span className="mt-[3px] block text-[13px] text-muted">
                            {f.cat} · {f.base}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-bold whitespace-nowrap">{f.k} kcal</span>
                          <span className="mt-[3px] block text-[13px] whitespace-nowrap text-violet-soft">{f.p} g protein</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {list.length === 0 && (
                  <EmptyState className="gap-2.5 rounded-2xl px-5 py-8">
                    <p className="text-[16px] font-bold">No match for “{query.trim()}”</p>
                    <p className="text-[14px] text-muted">Try another word, or add it yourself.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDraft((d) => ({ ...d, name: query.trim() }));
                        changeTab('custom');
                      }}
                    >
                      Add as custom food
                    </Button>
                  </EmptyState>
                )}
              </section>

              <Card
                as="aside"
                ref={detailsRef}
                aria-label="Food details"
                className="hidden lg:flex min-w-0 flex-col gap-5 sticky top-8"
              >
                {food ? (
                  <>
                    <div>
                      <p className="text-[13px] font-medium text-muted">{food.cat}</p>
                      <h2 className="mt-1 text-[24px] font-bold md:text-[26px]">{food.name}</h2>
                    </div>
                    <div>
                      <p className="mb-2 text-[13px] font-medium text-muted">Serving size</p>
                      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Serving size">
                        {servings.map((x, i) => (
                          <Chip key={x.label} on={svIdx === i} onClick={() => setSvIdx(i)}>
                            {x.label}
                          </Chip>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-medium text-muted">Number of servings</p>
                      <div className="flex items-center gap-3">
                        <StepButton label="Fewer servings" onClick={() => setQty((v) => Math.max(QTY_MIN, v - QTY_STEP))}>
                          −
                        </StepButton>
                        <span className="min-w-11 text-center font-display text-[22px] font-bold" aria-live="polite">
                          {qty}
                        </span>
                        <StepButton label="More servings" onClick={() => setQty((v) => Math.min(QTY_MAX, v + QTY_STEP))}>
                          +
                        </StepButton>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-line bg-row p-[18px]">
                      <div className="flex items-baseline gap-2">
                        <p className="font-display text-[38px] font-extrabold text-lime">{n.k}</p>
                        <p className="text-muted">kcal</p>
                      </div>
                      <dl className="mt-3 flex flex-wrap gap-[22px]">
                        {(
                          [
                            ['Protein', n.p, 'text-violet-soft'],
                            ['Carbs', n.c, ''],
                            ['Fats', n.f, ''],
                          ] as const
                        ).map(([label, v, cls]) => (
                          <div key={label}>
                            <dt className="text-[13px] font-medium text-muted">{label}</dt>
                            <dd className={clsx('mt-0.5 font-bold', cls)}>{v} g</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </>
                ) : (
                  <p className="py-10 text-center text-[15px] text-muted">Pick a food on the left to see its details.</p>
                )}

                {mealChips}

                {food && (
                  <>
                    <p className="rounded-[14px] border border-violet-line bg-violet-deep px-4 py-3.5 text-[14px] leading-[1.55] text-violet-text">
                      After adding:{' '}
                      <strong>
                        {num(nk)} / {num(tg.kcal)} kcal
                      </strong>{' '}
                      ·{' '}
                      <strong>
                        {np} / {tg.protein} g protein
                      </strong>
                      . {afterNote}
                    </p>
                    <Button size="xl" className="text-[16px]" onClick={addSelected} data-testid="add-selected-food-button">
                      Add to {MEAL_NAME[meal]}
                    </Button>
                  </>
                )}
              </Card>
            </>
          )}

          {tab === 'custom' && (
            <form onSubmit={addCustom} noValidate className={cardClass('default', 'flex max-w-[640px] min-w-0 flex-col gap-4 col-span-full')}>
              <div>
                <h2 className="text-[22px] font-bold md:text-[24px]">Custom food</h2>
                <p className="mt-1 text-[15px] text-muted">For homemade meals or foods that aren&apos;t in the search results.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="cn" className="mb-2 block">
                    Food name
                  </Label>
                  <Field
                    id="cn"
                    data-testid="custom-food-name"
                    type="text"
                    fieldSize="lg"
                    placeholder="e.g. Homemade protein bar"
                    value={draft.name}
                    onChange={editDraft('name', true)}
                    invalid={err === 'Give the food a name.'}
                  />
                </div>
                <div>
                  <Label htmlFor="cs" className="mb-2 block">
                    Serving size
                  </Label>
                  <Field id="cs" type="text" fieldSize="lg" placeholder="e.g. 1 bar (60 g)" value={draft.serving} onChange={editDraft('serving', false)} />
                </div>
                <div>
                  <Label className="mb-2 block">Nutritional values</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {(
                      [
                        ['ck', 'k', 'Calories', 'kcal'],
                        ['cp', 'p', 'Protein (g)', 'g'],
                        ['cc', 'c', 'Carbs (g)', 'g'],
                        ['cf', 'f', 'Fats (g)', 'g'],
                      ] as const
                    ).map(([id, key, label, ph]) => (
                      <div key={id}>
                        <Label htmlFor={id} className="text-[12px] text-muted mb-1 block">
                          {label}
                        </Label>
                        <Field
                          id={id}
                          data-testid={key === 'k' ? 'custom-food-calories' : undefined}
                          type="number"
                          inputMode="decimal"
                          fieldSize="md"
                          placeholder={ph}
                          value={draft[key]}
                          onChange={editDraft(key, key === 'k')}
                          invalid={key === 'k' && err === 'Enter calories as a number above 0.'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {mealChips}
              {err && (
                <Alert tone="error" className="px-3.5 py-2.5 text-[14px]">
                  {err}
                </Alert>
              )}
              <Button type="submit" size="xl" className="text-[16px] mt-2" data-testid="custom-food-submit">
                Add to {MEAL_NAME[meal]}
              </Button>
            </form>
          )}
        </div>

        <BottomSheet open={mobileSheetOpen} onClose={() => setMobileSheetOpen(false)} title={food?.name}>
          {food && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-[13px] font-medium text-muted">Serving size</p>
                <div className="flex flex-wrap gap-2.5" role="group" aria-label="Serving size">
                  {servings.map((x, i) => (
                    <Chip key={x.label} on={svIdx === i} onClick={() => setSvIdx(i)}>
                      {x.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-medium text-muted">Number of servings</p>
                <div className="flex items-center gap-3">
                  <StepButton onClick={() => setQty((q) => Math.max(QTY_MIN, +(q - QTY_STEP).toFixed(1)))} label="Decrease quantity">
                    −
                  </StepButton>
                  <span className="min-w-10 text-center font-display text-[22px] font-bold">{qty}</span>
                  <StepButton onClick={() => setQty((q) => Math.min(QTY_MAX, +(q + QTY_STEP).toFixed(1)))} label="Increase quantity">
                    +
                  </StepButton>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 rounded-2xl border border-line bg-sidebar p-3.5 text-center">
                <div>
                  <p className="font-display text-[17px] font-bold">{num(n.k)}</p>
                  <p className="text-[11px] text-muted">kcal</p>
                </div>
                <div>
                  <p className="font-display text-[17px] font-bold text-lime">{n.p} g</p>
                  <p className="text-[11px] text-muted">protein</p>
                </div>
                <div>
                  <p className="font-display text-[17px] font-bold text-violet-soft">{n.c} g</p>
                  <p className="text-[11px] text-muted">carbs</p>
                </div>
                <div>
                  <p className="font-display text-[17px] font-bold text-amber">{n.f} g</p>
                  <p className="text-[11px] text-muted">fats</p>
                </div>
              </div>

              {mealChips}

              <p className="text-[13px] leading-normal text-muted">{afterNote}</p>

              <Button size="xl" className="text-[16px]" onClick={addSelected}>
                Add to {MEAL_NAME[meal]}
              </Button>
            </div>
          )}
        </BottomSheet>
      </Stack>
    </PageContainer>
  );
}
