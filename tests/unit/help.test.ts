import { describe, it, expect } from 'vitest';
import { HELP_SECTIONS, HELP_TOPICS, HELP_DISCLAIMER } from '@/content/help';

describe('Help Content Repository (src/content/help.ts)', () => {
  it('has a valid medical disclaimer', () => {
    expect(HELP_DISCLAIMER).toBeTruthy();
    expect(HELP_DISCLAIMER).toContain('FitAI gives general fitness guidance, not medical advice');
  });

  it('contains all required sections', () => {
    const sectionIds = HELP_SECTIONS.map((s) => s.id);
    const requiredSections = [
      'getting-started',
      'dashboard',
      'workouts',
      'workout-details',
      'active-workout',
      'nutrition',
      'food-search',
      'progress',
      'coach',
      'profile',
      'onboarding',
      'glossary',
      'faq',
      'privacy',
      'feedback',
    ];

    requiredSections.forEach((req) => {
      expect(sectionIds).toContain(req);
    });
  });

  it('ensures every topic has valid non-empty fields and maps to a real section', () => {
    const validSectionIds = new Set(HELP_SECTIONS.map((s) => s.id));
    const entries = Object.entries(HELP_TOPICS);

    expect(entries.length).toBeGreaterThan(30);

    for (const [id, topic] of entries) {
      expect(topic.id, `Topic id mismatch for ${id}`).toBe(id);
      expect(topic.title.trim().length, `Missing title for ${id}`).toBeGreaterThan(0);
      expect(topic.short.trim().length, `Missing short explanation for ${id}`).toBeGreaterThan(15);
      expect(topic.howTo.trim().length, `Missing howTo guide for ${id}`).toBeGreaterThan(10);
      expect(topic.tip.trim().length, `Missing pro tip for ${id}`).toBeGreaterThan(10);
      expect(validSectionIds.has(topic.sectionId), `Invalid sectionId ${topic.sectionId} in topic ${id}`).toBe(true);
    }
  });

  it('covers all Section 3 placements with dedicated help topics', () => {
    const requiredTopicIds = [
      // Dashboard
      'calories-ring',
      'protein-target',
      'workout-status',
      'goal-progress',
      'weight-trend',
      'nutrition-card',
      'coach-card',

      // Workouts
      'ai-plan',
      'calendar-statuses',
      'muscle-groups',
      'custom-routines',

      // Workout Details
      'sets-reps-weight-rest',
      'session-estimate',
      'nova-notes',

      // Active Workout
      'workout-timer',
      'volume-stat',
      'set-row-tracking',
      'rest-timer',
      'finish-workout',

      // Nutrition
      'remaining-calories',
      'macro-split',
      'ai-meal-suggestion',
      'serving-size',
      'meal-log',

      // Food Search
      'search-serving',
      'search-servings-count',
      'after-adding-preview',
      'custom-food',

      // Progress
      'weight-history',
      'goal-progress-calc',
      'workout-consistency',
      'calorie-trend',
      'strength-progress',
      'progress-insights',

      // AI Coach
      'nova-context',
      'data-privacy',
      'suggested-prompts',

      // Profile & Settings
      'profile-goal',
      'daily-targets-recalc',
      'profile-experience',
      'profile-diet',
      'profile-notifications',
      'delete-account',

      // Onboarding
      'onboarding-step-1',
      'onboarding-step-2',
      'onboarding-step-3',
      'onboarding-step-4',
      'onboarding-step-5',
    ];

    requiredTopicIds.forEach((id) => {
      expect(HELP_TOPICS[id], `Missing required help topic: ${id}`).toBeDefined();
      expect(HELP_TOPICS[id].short.length).toBeGreaterThan(0);
    });
  });
});

