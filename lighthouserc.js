module.exports = {
  ci: {
    collect: {
      url: [
        'http://127.0.0.1:3333/login',
        'http://127.0.0.1:3333/onboarding',
        'http://127.0.0.1:3333/dashboard',
        'http://127.0.0.1:3333/workouts',
        'http://127.0.0.1:3333/workouts/details',
        'http://127.0.0.1:3333/nutrition',
        'http://127.0.0.1:3333/coach',
        'http://127.0.0.1:3333/progress',
        'http://127.0.0.1:3333/profile',
      ],
      startServerCommand: 'npx next start -H 127.0.0.1 -p 3333',
      startServerReadyPattern: 'Ready in',
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless --disable-gpu --disable-dev-shm-usage',
      },
      chromePath: process.env.CHROME_PATH || '/home/hp/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome',
    },
    assert: {
      assertions: {
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
