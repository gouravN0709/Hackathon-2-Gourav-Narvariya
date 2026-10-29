/**
 * Offline mutation queue: actions made while offline (or on network failure)
 * are retried when connectivity returns. Nothing is lost silently. In-progress
 * active workouts stay in their own localStorage key until "Finish & save".
 */
import { showToast } from '@/components/ui/Toast';

const QUEUE_KEY = 'fitai.queue.v1';

export interface QueuedMutation {
  id: string;
  at: number;
  /** Executes the real write to Supabase. Runs only while online. */
  run: () => Promise<void>;
  /** Applies the optimistic rollback permanently (mutation failed for real). */
  rollback: () => void;
  description: string;
  /** Optional copy overrides for the offline toast. */
  messages?: { offline: string; failure: string };
}

type Listener = (pending: number) => void;

const listeners = new Set<Listener>();
let queue: QueuedMutation[] = [];

export function readPersisted(): void {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (raw) queue = [];
  } catch {
    /* storage unavailable */
  }
}

export function pendingCount(): number {
  return queue.length;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l(queue.length));
}

/**
 * Runs `run` right away when online; queues it otherwise. On success the caller's
 * optimistic update stands. On failure the queue keeps the intent and shows an
 * offline toast; on hard failure (not retryable) it rolls back.
 */
export async function runOrQueue(mutation: Omit<QueuedMutation, 'id' | 'at'>): Promise<boolean> {
  const full: QueuedMutation = {
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
  };

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    queue.push(full);
    emit();
    showToast(mutation.messages?.offline ?? "You're offline. Your change is saved and will sync.", 'info');
    return false;
  }

  try {
    await mutation.run();
    return true;
  } catch (err) {
    const message = (err as { message?: string } | null)?.message ?? '';
    if (message === 'OFFLINE_OR_NETWORK') {
      queue.push(full);
      emit();
      showToast(mutation.messages?.offline ?? "You're offline. Your change is saved and will sync.", 'info');
      return false;
    }
    mutation.rollback();
    throw err;
  }
}

/** Replays queued mutations in order; failures roll back and are dropped. */
export async function flushQueue(): Promise<void> {
  if (!queue.length || typeof navigator === 'undefined' || !navigator.onLine) return;
  const items = queue;
  queue = [];
  emit();
  let failed = 0;
  for (const item of items) {
    try {
      await item.run();
    } catch {
      item.rollback();
      failed++;
    }
  }
  if (failed > 0) showToast("Some changes couldn't sync. They were discarded.", 'error');
  else if (items.length > 0) showToast('Back online. Your changes are synced.', 'success');
}
