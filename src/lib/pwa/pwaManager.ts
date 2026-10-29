'use client';

import { showToast } from '@/components/ui/Toast';

export const PWA_STORAGE_KEYS = {
  VISITS: 'fitai.visits',
  ACTIONS: 'fitai.actionsCount',
  DISMISSED_UNTIL: 'fitai.installDismissedUntil',
  ACTIVE_WORKOUT: 'fitai.activeWorkout',
} as const;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isOnlineState = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isStandaloneState = false;
  private waitingWorker: ServiceWorker | null = null;
  private updatePending = false;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window === 'undefined') return;

    this.checkStandalone();
    this.recordVisit();
    this.initNetworkListeners();
    this.initInstallPromptListener();

    // Test hook for simulating waiting worker updates
    (window as unknown as { pwaTestTriggerUpdate?: () => void }).pwaTestTriggerUpdate = () => {
      if (this.hasActiveWorkout()) {
        return;
      }
      showToast('Update available', 'info', {
        undoLabel: 'Update',
        onUndo: () => {
          this.applyUpdate();
        },
      });
    };
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public checkStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    const isStandaloneMQ = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    this.isStandaloneState = isStandaloneMQ || isIosStandalone;
    return this.isStandaloneState;
  }

  public get isStandalone(): boolean {
    return this.isStandaloneState;
  }

  public get isOnline(): boolean {
    return this.isOnlineState;
  }

  public get canPromptInstall(): boolean {
    return !!this.deferredPrompt;
  }

  public isIos(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua);
  }

  public isIosSafari(): boolean {
    if (!this.isIos()) return false;
    const ua = window.navigator.userAgent.toLowerCase();
    // In iOS browsers: Safari contains "safari" and "mobile" but does not contain "crios" or "fxios"
    return (
      ua.includes('safari') &&
      !ua.includes('crios') &&
      !ua.includes('fxios') &&
      !this.isStandaloneState
    );
  }

  private recordVisit() {
    try {
      const visits = parseInt(localStorage.getItem(PWA_STORAGE_KEYS.VISITS) || '0', 10);
      localStorage.setItem(PWA_STORAGE_KEYS.VISITS, String(visits + 1));
    } catch {}
  }

  public recordAction() {
    try {
      const actions = parseInt(localStorage.getItem(PWA_STORAGE_KEYS.ACTIONS) || '0', 10);
      localStorage.setItem(PWA_STORAGE_KEYS.ACTIONS, String(actions + 1));
      this.emit();
    } catch {}
  }

  public shouldShowInstallBanner(): boolean {
    if (this.isStandaloneState) return false;

    try {
      // Check if dismissed within 14 days
      const dismissedUntil = localStorage.getItem(PWA_STORAGE_KEYS.DISMISSED_UNTIL);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        return false;
      }

      const visits = parseInt(localStorage.getItem(PWA_STORAGE_KEYS.VISITS) || '0', 10);
      const actions = parseInt(localStorage.getItem(PWA_STORAGE_KEYS.ACTIONS) || '0', 10);

      // Must be at least second visit OR after completing a first action (never on first load)
      if (visits < 2 && actions < 1) {
        return false;
      }

      // Either we have deferred beforeinstallprompt OR iOS Safari instructions
      return !!this.deferredPrompt || this.isIosSafari();
    } catch {
      return false;
    }
  }

  public dismissInstallBanner(days = 14) {
    try {
      const expiration = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(PWA_STORAGE_KEYS.DISMISSED_UNTIL, String(expiration));
      this.emit();
    } catch {}
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.emit();
        return true;
      }
    } catch (err) {
      console.warn('[FitAI PWA] prompt error:', err);
    }
    return false;
  }

  private initInstallPromptListener() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.emit();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.isStandaloneState = true;
      this.emit();
    });
  }

  private initNetworkListeners() {
    window.addEventListener('offline', () => {
      this.isOnlineState = false;
      showToast("You're offline. Changes are saved on this device.", 'info');
      this.emit();
    });

    window.addEventListener('online', () => {
      this.isOnlineState = true;
      showToast('Back online.', 'success');
      this.emit();
    });
  }

  public hasActiveWorkout(): boolean {
    try {
      return !!localStorage.getItem(PWA_STORAGE_KEYS.ACTIVE_WORKOUT);
    } catch {
      return false;
    }
  }

  public registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Disabled in development unless explicit test flag is set
    const isProd = process.env.NODE_ENV === 'production';
    const isSwTestingEnabled = (window as unknown as { __FITAI_ENABLE_SW__?: boolean }).__FITAI_ENABLE_SW__;
    if (!isProd && !isSwTestingEnabled) return;

    const doRegister = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // If already waiting
          if (registration.waiting) {
            this.handleUpdateWaiting(registration.waiting);
          }

          registration.addEventListener('updatefound', () => {
            const installing = registration.installing;
            if (!installing) return;

            installing.addEventListener('statechange', () => {
              if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                this.handleUpdateWaiting(installing);
              }
            });
          });
        })
        .catch((err) => {
          console.warn('[FitAI SW] Registration failed:', err);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    };

    if (document.readyState === 'complete') {
      doRegister();
    } else {
      window.addEventListener('load', doRegister);
    }
  }

  private handleUpdateWaiting(worker: ServiceWorker) {
    this.waitingWorker = worker;
    this.updatePending = true;

    // If an Active Workout is currently in progress, wait until it is saved or exited
    if (this.hasActiveWorkout()) {
      const checkWorkoutInterval = setInterval(() => {
        if (!this.hasActiveWorkout()) {
          clearInterval(checkWorkoutInterval);
          this.showUpdateToast();
        }
      }, 3000);
      return;
    }

    this.showUpdateToast();
  }

  public showUpdateToast() {
    if (!this.waitingWorker) return;
    showToast('Update available', 'info', {
      undoLabel: 'Update',
      onUndo: () => {
        this.applyUpdate();
      },
    });
  }

  public applyUpdate() {
    if (this.waitingWorker) {
      this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

export const pwaManager = new PWAManager();
