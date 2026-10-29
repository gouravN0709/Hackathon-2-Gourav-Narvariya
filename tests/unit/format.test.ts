import { describe, it, expect } from 'vitest';
import { num, signed, mmss, dur, setLine } from '@/lib/format';
import { fmt, fmtLong, fmtFull, dow, weekStart, addDays } from '@/lib/date';
import type { Exercise } from '@/types/domain';

describe('Formatters & Date Helpers', () => {
  it('num formats numbers with thousands separators', () => {
    expect(num(1640)).toBe('1,640');
    expect(num(2400)).toBe('2,400');
    expect(num(1000000)).toBe('1,000,000');
    expect(num(0)).toBe('0');
  });

  it('signed adds + or - sign to values', () => {
    expect(signed(1.5)).toBe('+1.5');
    expect(signed(-2.3)).toBe('-2.3');
    expect(signed(0)).toBe('+0.0');
  });

  it('mmss formats seconds into MM:SS', () => {
    expect(mmss(0)).toBe('0:00');
    expect(mmss(58)).toBe('0:58');
    expect(mmss(90)).toBe('1:30');
    expect(mmss(3600)).toBe('60:00');
  });

  it('dur formats minutes into human readable duration', () => {
    expect(dur(58)).toBe('58 min');
    expect(dur(120)).toBe('2 h 00 min');
    expect(dur(135)).toBe('2 h 15 min');
  });

  it('setLine formats exercise sets and reps description', () => {
    const ex1: Exercise = {
      id: 'ex1',
      name: 'Bench Press',
      sets: 3,
      reps: 8,
      kg: 70,
      muscle: 'Chest',
      lift: 'bench',
      rest: 90,
      step: 2.5,
      tip: 'Stay tight',
    };
    expect(setLine(ex1)).toBe('3 × 8 · 70 kg');

    const ex2: Exercise = {
      id: 'ex2',
      name: 'Pull-up',
      sets: 4,
      reps: 10,
      kg: 0,
      muscle: 'Back',
      lift: null,
      rest: 60,
      step: 1,
      tip: 'Chest to bar',
    };
    expect(setLine(ex2)).toBe('4 × 10 · bodyweight');
  });

  it('date helpers format ISODates correctly', () => {
    expect(fmt('2026-10-15')).toBe('Oct 15');
    expect(fmtLong('2026-10-15')).toBe('Thu, Oct 15');
    expect(fmtFull('2026-10-15')).toBe('Thursday, Oct 15');
    expect(dow('2026-10-15')).toBe(3); // Thursday = 3 (Mon=0, Tue=1, Wed=2, Thu=3)
    expect(weekStart('2026-10-15')).toBe('2026-10-12'); // Mon Oct 12
    expect(addDays('2026-10-15', 3)).toBe('2026-10-18');
  });
});
