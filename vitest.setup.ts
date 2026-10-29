import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

// Freeze date to 2026-10-15
vi.setSystemTime(new Date('2026-10-15T12:00:00Z'));

beforeEach(() => {
  localStorage.clear();
  vi.setSystemTime(new Date('2026-10-15T12:00:00Z'));
});

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill AudioContext
class MockAudioContext {
  state = 'running';
  createGain() {
    return {
      connect() {},
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
    };
  }
  createOscillator() {
    return {
      connect() {},
      start() {},
      stop() {},
      frequency: { setValueAtTime() {} },
      type: 'sine',
    };
  }
  close() {
    return Promise.resolve();
  }
}
// @ts-expect-error mock AudioContext
window.AudioContext = MockAudioContext;
// @ts-expect-error mock webkitAudioContext
window.webkitAudioContext = MockAudioContext;

