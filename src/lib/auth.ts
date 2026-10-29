/**
 * Client-side auth helpers over the browser Supabase session, plus the friendly
 * copy mapping used by the login and reset-password screens.
 */
import { createClient } from '@/lib/supabase/client';

/** Maps raw auth error copy to calm, user-facing messages. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return "That email and password don't match. Try again.";
  if (m.includes('already registered')) return 'An account with this email already exists. Log in instead.';
  if (m.includes('anonymous sign-ins are disabled')) return 'Continue with your email and password.';
  if (m.includes('rate limit')) return 'Too many attempts. Wait a minute and try again.';
  if (m.includes('at least 6 characters') || m.includes('weak password'))
    return 'Use at least 8 characters for your password.';
  if (m.includes('email not confirmed')) return 'Confirm your email first, then log in.';
  if (m.includes('session not found') || m.includes('refresh token')) {
    return 'Your session ended. Log in to continue.';
  }
  return 'Something went wrong. Try again.';
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await createClient().auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: friendlyAuthError(error.message) };
  return { ok: true };
}

export async function signUp(
  name: string,
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await createClient().auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) return { ok: false, message: friendlyAuthError(error.message) };
  return { ok: true };
}

/** Sends the recovery link; the app processes it on /reset-password. */
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { ok: false, message: friendlyAuthError(error.message) };
  return { ok: true };
}

/** Changes the signed-in user's password (the session already proves identity). */
export async function changePassword(password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await createClient().auth.updateUser({ password });
  if (error) return { ok: false, message: friendlyAuthError(error.message) };
  return { ok: true };
}

/** Sets a new password during a recovery-link session (on /reset-password). */
export async function completePasswordReset(
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await createClient().auth.updateUser({ password });
  if (error) return { ok: false, message: friendlyAuthError(error.message) };
  return { ok: true };
}
