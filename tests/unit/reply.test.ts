import { describe, it, expect } from 'vitest';
import { reply } from '@/lib/reply';
import { seed } from '@/lib/data/seed';
import { TODAY } from '@/lib/date';

describe('reply (Mock AI Coach Nova)', () => {
  it('replies to progress questions with 30-day stats', () => {
    const s = seed();
    const ans = reply(s, 'Analyze my progress.');
    expect(ans).toContain('+1.5 kg');
    expect(ans).toContain('76.4 kg');
    expect(ans).toContain('protein');
  });

  it('replies to goal questions with goal percentage and kg to go', () => {
    const s = seed();
    const ans = reply(s, 'What is my goal?');
    expect(ans).toContain('55%');
    expect(ans).toContain('80 kg');
    expect(ans).toContain('3.6 kg');
  });

  it('replies to meal / vegetarian questions with food recommendation and remaining macros', () => {
    const s = seed();
    const ans = reply(s, 'Suggest a high-protein vegetarian dinner');
    expect(ans).toContain('paneer tikka bowl');
    expect(ans).toContain('760 kcal');
    expect(ans).toContain('48 g protein');
  });

  it('replies to workout questions with today session plan before completion', () => {
    const s = seed();
    const ans = reply(s, 'What workout should I do today?');
    expect(ans).toContain('Chest & Triceps');
    expect(ans).toContain('72.5 kg');
  });

  it('replies to workout questions with completion message after completion', () => {
    const s = seed();
    s.sessions.push({ date: TODAY, key: 'chest', name: 'Chest & Triceps', minutes: 58, volume: 4200 });
    const ans = reply(s, 'What should I train today?');
    expect(ans).toContain('already finished Chest & Triceps today');
  });

  it('replies to weight questions with current weight and distance to goal', () => {
    const s = seed();
    const ans = reply(s, 'What is my current weight?');
    expect(ans).toContain('76.4 kg');
    expect(ans).toContain('3.6 kg');
  });

  it('falls back to default encouragement for general queries', () => {
    const s = seed();
    const ans = reply(s, 'Hello Nova!');
    expect(ans).toContain('Good question.');
    expect(ans).toContain('train 4 days');
  });
});

