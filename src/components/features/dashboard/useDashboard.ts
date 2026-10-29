'use client';

import { useMemo } from 'react';
import { WORKOUTS } from '@/lib/data/workouts';
import { GOAL_NAME, num, numberWord, pct, setLine, signed } from '@/lib/format';
import {
  goalPct,
  kgToGo,
  latestWeight,
  lifts,
  macroSplit,
  sessionsThisWeek,
  today,
  totals,
  week,
  weightDelta,
  workoutExercises,
} from '@/lib/selectors';
import { useFitData } from '@/lib/store';

export type SegmentState = 'done' | 'today' | 'later';

/** Everything the dashboard shows, derived from the store. */
export function useDashboard() {
  const s = useFitData();
  return useMemo(() => {
    const U = s.user;
    const TG = U.targets;
    const T = totals(s);
    const td = today(s);
    const done = td.status === 'done';
    const workout = td.workout;
    const nsw = sessionsThisWeek(s);
    const proteinLeft = Math.max(0, TG.protein - T.p);
    const bench = lifts(s, 30)[0];
    const plural = nsw === 1 ? 'session' : 'sessions';
    const exercises = workout ? workoutExercises(s, workout.key) : WORKOUTS.chest.exercises;

    return {
      first: U.first,
      initial: U.name.charAt(0).toUpperCase(),
      goalName: GOAL_NAME[U.goal],
      rawWeight: latestWeight(s),
      weight: latestWeight(s).toFixed(1),
      goalWeight: U.goalWeight,
      tipVisible: !s.ui.tipDismissed,
      rawKcal: T.k,
      kcal: num(T.k),
      kcalTarget: num(TG.kcal),
      kcalLeft: num(Math.max(0, TG.kcal - T.k)),
      calPct: pct(T.k, TG.kcal),
      rawProtein: T.p,
      protein: T.p,
      proteinTarget: TG.protein,
      protPct: pct(T.p, TG.protein),
      protNote: proteinLeft > 0 ? `${proteinLeft} g to go. One shake covers it.` : 'Protein target reached. Nice.',
      totals: T,
      targets: TG,
      done,
      isRest: !workout,
      wStatus: done ? 'Completed' : workout ? 'Planned' : 'Rest',
      wName: workout ? workout.name : 'Rest day',
      wSub: done && td.session
        ? `${td.session.minutes} min · ${num(td.session.volume)} kg volume`
        : workout
          ? `6:30 PM · ${nsw} of 4 sessions done this week`
          : `Recovery · ${nsw} of 4 sessions done this week`,
      segs: week(s)
        .filter((d) => d.workout)
        .map((d): SegmentState => (d.status === 'done' ? 'done' : d.status === 'today' ? 'today' : 'later')),
      sessionsDone: nsw,
      wDelta: `${signed(weightDelta(s, 30))} kg`,
      goalPct: goalPct(s),
      toGo: kgToGo(s),
      wMin: workout?.minutes ?? 0,
      wCount: exercises.length,
      wKcal: workout?.kcal ?? 0,
      exercises: exercises.slice(0, 4).map((e) => ({ id: e.id, name: e.name, detail: setLine(e) })),
      coachText: `You've completed ${numberWord(nsw)} strength ${plural} this week. ${
        done
          ? "Great work finishing today's session. Refuel and rest up."
          : workout
            ? "Stay consistent and follow today's planned workout."
            : 'Today is a rest day, so recover well for your next session.'
      }`,
      insight1:
        proteinLeft > 0
          ? `Protein is ${proteinLeft} g short. A Greek yogurt bowl this afternoon gets you there.`
          : 'Protein target hit. Keep dinner balanced.',
      insight2: done
        ? `Bench top set is now ${bench.to} kg, up from ${bench.from} kg 30 days ago.`
        : `Bench press is up ${+(bench.to - bench.from).toFixed(1)} kg in four weeks. Aim for 72.5 kg today.`,
      split: macroSplit(T),
    };
  }, [s]);
}

export type DashboardData = ReturnType<typeof useDashboard>;
