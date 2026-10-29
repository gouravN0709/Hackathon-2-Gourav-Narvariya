'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const TOUR_SEEN_KEY = 'fitai.tourSeen';
export const START_TOUR_EVENT = 'fitai:start-tour';

export function startAppTour() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(START_TOUR_EVENT));
  }
}

export function useTour() {
  const [tourActive, setTourActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => {
      setStepIndex(0);
      setTourActive(true);
      router.push('/dashboard');
    };

    window.addEventListener(START_TOUR_EVENT, handleStart);
    return () => window.removeEventListener(START_TOUR_EVENT, handleStart);
  }, [router]);

  const completeTour = useCallback(() => {
    setTourActive(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(TOUR_SEEN_KEY, 'true');
      } catch {}
    }
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((idx) => idx + 1);
  }, []);

  const prevStep = useCallback(() => {
    setStepIndex((idx) => Math.max(0, idx - 1));
  }, []);

  return {
    tourActive,
    stepIndex,
    startTour: () => {
      setStepIndex(0);
      setTourActive(true);
      router.push('/dashboard');
    },
    nextStep,
    prevStep,
    completeTour,
  };
}

