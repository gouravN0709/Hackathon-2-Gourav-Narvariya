import { describe, it, expect } from 'vitest';
import { seed } from '@/lib/data/seed';
import { TODAY } from '@/lib/date';
import {
  totals,
  latestWeight,
  weightSeries,
  goalPct,
  kgToGo,
  stats,
  sessionsThisWeek,
  bars,
  lifts,
  dayInfo,
  week,
  today,
  calcTargets,
  avgIntake,
  calorieSeries,
  weightDelta,
} from '@/lib/selectors';

describe('Selectors', () => {
  const s = seed();

  it('totals calculates seeded nutrition totals correctly', () => {
    const t = totals(s);
    // Seed: 1640 kcal, 112g protein, 168g carbs, 48g fats
    expect(t.k).toBe(1640);
    expect(t.p).toBe(112);
    expect(t.c).toBe(168);
    expect(t.f).toBe(48);
  });

  it('latestWeight returns today weight if present', () => {
    expect(latestWeight(s)).toBe(76.4);
    const series = weightSeries(s, 7);
    expect(series.length).toBe(7);
    expect(series[series.length - 1].v).toBe(76.4);
  });

  it('goalPct calculates progress toward goal weight', () => {
    // start 72, current 76.4, goal 80 -> (76.4 - 72) / (80 - 72) = 4.4 / 8 = 55%
    expect(goalPct(s)).toBe(55);
  });

  it('kgToGo calculates remaining kg to reach goal', () => {
    // 80 - 76.4 = 3.6
    expect(kgToGo(s)).toBe('3.6');
  });

  it('weightDelta computes difference over N days', () => {
    const d30 = weightDelta(s, 30);
    expect(d30).toBeCloseTo(1.5, 1);
  });

  it('sessionsThisWeek returns completed sessions for the current week', () => {
    // Mon (back) and Tue (legs) are done in seed
    expect(sessionsThisWeek(s)).toBe(2);
  });

  it('today returns correct dayInfo for TODAY (Thursday)', () => {
    const td = today(s);
    expect(td.date).toBe(TODAY);
    expect(td.key).toBe('chest');
    expect(td.status).toBe('today');
    expect(td.workout?.name).toBe('Chest & Triceps');

    const explicitInfo = dayInfo(s, TODAY);
    expect(explicitInfo.date).toBe(TODAY);
  });

  it('week returns 7 days starting from Monday', () => {
    const w = week(s);
    expect(w.length).toBe(7);
    expect(w[0].dow).toBe('Mon');
    expect(w[0].status).toBe('done');
    expect(w[1].dow).toBe('Tue');
    expect(w[1].status).toBe('done');
    expect(w[3].dow).toBe('Thu');
    expect(w[3].status).toBe('today');
    expect(w[4].dow).toBe('Fri');
    expect(w[4].status).toBe('planned');
    expect(w[5].dow).toBe('Sat');
    expect(w[5].status).toBe('rest');
  });

  it('calcTargets computes appropriate kcal and protein for goals', () => {
    const muscleTargets = calcTargets({ height: 178, age: 28, goal: 'muscle' }, 76.4);
    expect(muscleTargets.kcal).toBeGreaterThan(2000);
    expect(muscleTargets.protein).toBeGreaterThan(130);

    const fatLossTargets = calcTargets({ height: 178, age: 28, goal: 'fat' }, 76.4);
    expect(fatLossTargets.kcal).toBeLessThan(muscleTargets.kcal);
  });

  it('lifts returns historical top sets and current top for bench and squat', () => {
    const lf = lifts(s, 30);
    expect(lf.length).toBeGreaterThan(0);
    const bench = lf.find((l) => l.id === 'bench');
    expect(bench).toBeDefined();
    expect(bench?.from).toBe(65);
    expect(bench?.to).toBe(70);
    expect(bench?.goal).toBe(80);
  });

  it('stats calculates session completion stats over 7 and 30 days', () => {
    const st7 = stats(s, 7);
    expect(st7.planned).toBe(4);
    expect(st7.done).toBe(3);
  });

  it('avgIntake computes daily averages', () => {
    const avg = avgIntake(s, 30);
    expect(avg.k).toBeGreaterThan(1500);
    expect(avg.p).toBeGreaterThan(100);

    const calSeries = calorieSeries(s, 7);
    expect(calSeries.length).toBe(7);

    const barData = bars(s, 7);
    expect(barData.items.length).toBe(7);
  });
});
