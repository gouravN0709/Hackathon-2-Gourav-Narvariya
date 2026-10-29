'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useTour } from '@/components/features/help/useTour';

interface TourStep {
  title: string;
  targetDescription: string;
  body: string;
  highlightSelector?: string;
  tabLabel: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Dashboard summary cards',
    targetDescription: 'Calories ring, Protein, Today’s workout & Goal progress',
    body: 'Your home screen consolidates daily energy balance, protein target progress, today’s workout status, and weight trajectory in one view.',
    highlightSelector: '[data-tour="dashboard-summary"]',
    tabLabel: 'Summary',
  },
  {
    title: 'Quick actions',
    targetDescription: 'One-tap shortcuts for daily tracking',
    body: 'Log whole foods, record your morning weigh-in, jump right into your workout, or ask Nova for guidance with a single tap.',
    highlightSelector: '[data-tour="quick-actions"]',
    tabLabel: 'Actions',
  },
  {
    title: 'Workouts & planner',
    targetDescription: 'AI-generated 4-day split & active workout tracker',
    body: 'Explore your weekly training schedule, review exercise form cues from Nova, and track active sets with live weight steppers and rest countdown rings.',
    highlightSelector: '[data-tour="workouts"]',
    tabLabel: 'Workouts',
  },
  {
    title: 'Log food & nutrition',
    targetDescription: 'Whole foods database, portion sizes & macro targets',
    body: 'Search extensive Indian and whole foods databases, customize portion multipliers, and preview how meals impact your daily calorie and protein budget.',
    highlightSelector: '[data-tour="nutrition"]',
    tabLabel: 'Nutrition',
  },
  {
    title: 'Ask Nova (AI coach)',
    targetDescription: 'Data-literate coaching tailored to your body',
    body: 'Nova analyzes your logged workouts, meal history, and weight trend to provide contextual suggestions. In this frontend version, all replies are simulated client-side.',
    highlightSelector: '[data-tour="coach"]',
    tabLabel: 'Coach',
  },
];

export function CoachmarkTour() {
  const { tourActive, stepIndex, nextStep, prevStep, completeTour } = useTour();
  const cardRef = useRef<HTMLDivElement>(null);

  const totalSteps = TOUR_STEPS.length;
  const current = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === totalSteps - 1;

  useEffect(() => {
    if (!tourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        completeTour();
      } else if (e.key === 'ArrowRight' && !isLast) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && stepIndex > 0) {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tourActive, isLast, stepIndex, completeTour, nextStep, prevStep]);

  if (!tourActive || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App guided tour"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={completeTour}
        aria-hidden="true"
      />

      {/* Tour Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[480px] rounded-[20px] border border-line-strong bg-raised p-6 shadow-2xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <Pill tone="lime">Step {stepIndex + 1} of {totalSteps}</Pill>
            <span className="text-[13px] font-medium text-muted">{current.tabLabel}</span>
          </div>
          <button
            type="button"
            onClick={completeTour}
            aria-label="Close tour"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-card hover:text-fg"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="pt-4">
          <h2 className="font-display text-[22px] font-bold text-fg">
            {current.title}
          </h2>
          <p className="mt-1 text-[13px] font-medium text-lime">
            {current.targetDescription}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-soft">
            {current.body}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === stepIndex ? 'w-6 bg-lime' : 'w-2 bg-line-strong'
              }`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
          <Button variant="ghost" size="sm" onClick={completeTour} data-testid="tour-skip-button">
            Skip tour
          </Button>

          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <Button variant="ghost" size="sm" onClick={prevStep} data-testid="tour-prev-button">
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={isLast ? completeTour : nextStep}
              data-testid="tour-next-button"
            >
              {isLast ? 'Got it!' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

