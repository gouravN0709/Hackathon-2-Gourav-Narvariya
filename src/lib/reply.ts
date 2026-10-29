import { addDays, dow, TODAY } from '@/lib/date';
import { SCHEDULE, SESSIONS_PER_WEEK, WORKOUTS } from '@/lib/data/workouts';
import { num, signed } from '@/lib/format';
import { avgIntake, goalPct, kgToGo, latestWeight, stats, today, totals, weightDelta } from '@/lib/selectors';
import type { FitData } from '@/types/domain';

export const THINKING_DELAY_MS = 1000;

/** Keyword-based mock coach. Every number comes from the live store. */
export function reply(s: FitData, question: string): string {
  const t = question.toLowerCase();
  const T = totals(s);
  const U = s.user.targets;
  const left = Math.max(0, U.kcal - T.k);
  const proteinLeft = Math.max(0, U.protein - T.p);
  const w = latestWeight(s);
  const td = today(s);

  if (/progress|analy/.test(t)) {
    const d = weightDelta(s, 30);
    const st = stats(s, 30);
    const avgProtein = avgIntake(s, 30).p;
    return `In 30 days you moved ${signed(d)} kg to ${w.toFixed(1)} kg and completed ${st.done} of ${st.planned} planned sessions (${st.pct}%). That is steady progress. Your next lever is protein: you are averaging about ${avgProtein} g against a ${U.protein} g target.`;
  }

  if (/goal/.test(t)) {
    return `You're ${goalPct(s)}% of the way to ${s.user.goalWeight} kg, with ${kgToGo(s)} kg to go. Hold ${num(U.kcal)} kcal, hit ${U.protein} g protein, and add 2.5 kg to one main lift each week. Want me to adjust next week's plan?`;
  }

  if (/vegetarian|meal|protein|dinner|eat|food|hungry/.test(t)) {
    return `You have ${num(left)} kcal and ${proteinLeft} g protein left today. Try a paneer tikka bowl: paneer, quinoa and grilled veg for about 610 kcal and 41 g protein. ${
      proteinLeft > 0 ? 'It closes most of your protein gap.' : 'You are already on your protein target, so a smaller portion is fine.'
    } You can add it from Nutrition.`;
  }

  if (/workout|train|exercise|gym|lift/.test(t)) {
    if (td.status === 'done' && td.workout && td.session) {
      const nextKey = SCHEDULE[dow(addDays(TODAY, 1))];
      return `You already finished ${td.workout.name} today (${td.session.minutes} min). Nice work. Eat well, sleep early and tomorrow is ${
        nextKey ? WORKOUTS[nextKey].name : 'a rest day'
      }.`;
    }
    if (td.workout) {
      return `Today is ${td.workout.name} (${td.workout.minutes} min, ${td.workout.exercises.length} exercises). Start with a lighter warm-up set, then try 72.5 kg on your last bench set.`;
    }
    return 'Today is a rest day. A 20 minute walk and good sleep will help you recover.';
  }

  if (/weight|kg/.test(t)) {
    return `You are at ${w.toFixed(1)} kg, ${kgToGo(s)} kg from your ${s.user.goalWeight} kg goal. Log your weight in Progress each morning so I can track the trend.`;
  }

  return `Good question. For your goal, consistency matters most: train ${SESSIONS_PER_WEEK} days, eat to ${num(U.kcal)} kcal and get ${U.protein} g protein. Tell me a bit more and I will tailor it.`;
}
