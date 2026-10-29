import { describe, it, expect } from 'vitest';
import { isEmail, inRange, parseNum } from '@/lib/validation';
import { validateDraft, draftFrom } from '@/components/features/profile/profileDraft';
import { seed } from '@/lib/data/seed';

describe('Validation Helpers', () => {
  it('isEmail validates correctly', () => {
    expect(isEmail('alex@example.com')).toBe(true);
    expect(isEmail('user.name+tag@sub.domain.co')).toBe(true);
    expect(isEmail('invalid')).toBe(false);
    expect(isEmail('no-at.com')).toBe(false);
    expect(isEmail('user@')).toBe(false);
    expect(isEmail('user@.com')).toBe(false);
    expect(isEmail('   ')).toBe(false);
  });

  it('inRange checks numeric bounds inclusive', () => {
    expect(inRange(14, 14, 90)).toBe(true);
    expect(inRange(90, 14, 90)).toBe(true);
    expect(inRange(50, 14, 90)).toBe(true);
    expect(inRange(13, 14, 90)).toBe(false);
    expect(inRange(91, 14, 90)).toBe(false);
    expect(inRange(NaN, 14, 90)).toBe(false);
  });

  it('parseNum parses valid numbers and returns NaN on invalid', () => {
    expect(parseNum('76.4')).toBe(76.4);
    expect(parseNum('100')).toBe(100);
    expect(parseNum('abc')).toBeNaN();
    expect(parseNum('')).toBeNaN();
  });
});

describe('Profile Draft Validation', () => {
  it('validates a valid draft without errors', () => {
    const s = seed();
    const draft = draftFrom(s);
    const result = validateDraft(draft);
    expect(result.error).toBe('');
    expect(result.field).toBeUndefined();
  });

  it('fails on empty name', () => {
    const s = seed();
    const draft = { ...draftFrom(s), name: '   ' };
    const result = validateDraft(draft);
    expect(result.error).toBe('Enter your name.');
    expect(result.field).toBe('name');
  });

  it('fails on invalid email', () => {
    const s = seed();
    const draft = { ...draftFrom(s), email: 'not-an-email' };
    const result = validateDraft(draft);
    expect(result.error).toBe('Enter a valid email address.');
    expect(result.field).toBe('email');
  });

  it('fails on out-of-range age', () => {
    const s = seed();
    const draft = { ...draftFrom(s), age: '12' };
    const result = validateDraft(draft);
    expect(result.error).toBe('Age must be between 14 and 90.');
    expect(result.field).toBe('age');
  });

  it('fails on out-of-range height', () => {
    const s = seed();
    const draft = { ...draftFrom(s), height: '240' };
    const result = validateDraft(draft);
    expect(result.error).toBe('Height must be between 120 and 230 cm.');
    expect(result.field).toBe('height');
  });

  it('fails on out-of-range weight', () => {
    const s = seed();
    const draft = { ...draftFrom(s), weight: '25' };
    const result = validateDraft(draft);
    expect(result.error).toBe('Current weight must be between 30 and 300 kg.');
    expect(result.field).toBe('weight');
  });

  it('fails on non-positive calorie targets', () => {
    const s = seed();
    const draft = { ...draftFrom(s), kcal: '0' };
    const result = validateDraft(draft);
    expect(result.error).toBe('Calories must be between 1,200 and 5,000.');
    expect(result.field).toBe('kcal');
  });
});
