import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export interface FeedbackInput {
  type: 'bug' | 'idea';
  message: string;
  email?: string;
}

/**
 * feedback is insert-only from clients (no SELECT policy): values are validated
 * by the caller's zod schema before this runs.
 */
export async function submitFeedback(
  client: SupabaseClient<Database>,
  userId: string | null,
  feedback: FeedbackInput,
): Promise<boolean> {
  const { error } = await client.from('feedback').insert({
    user_id: userId ?? null,
    type: feedback.type,
    message: feedback.message,
    email: feedback.email ?? '',
  });
  return !error;
}

/**
 * Simple per-user rate limit — 5 submissions per hour. The count query is allowed
 * to fail closed for authenticated users (they can select nothing, so count all
 * submissions made from this browser session instead).
 */
export async function feedbackAllowed(countSoFar: number): Promise<boolean> {
  return countSoFar < 5;
}
