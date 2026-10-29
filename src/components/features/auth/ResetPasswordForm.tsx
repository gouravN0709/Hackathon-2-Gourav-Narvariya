'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button, LinkButton } from '@/components/ui/Button';
import { Field, Label } from '@/components/ui/Field';
import { SuccessCheck } from '@/components/ui/misc';
import { completePasswordReset } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';

type Phase = 'checking' | 'form' | 'loading' | 'done' | 'expired';

/** New-password screen reached from the emailed recovery link. */
export function ResetPasswordForm() {
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [phase, setPhase] = useState<Phase>('checking');
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    void (async () => {
      // detectSessionInUrl exchanges the recovery code; then a session exists.
      const { data } = await createClient().auth.getSession();
      setPhase(data.session ? 'form' : 'expired');
    })();
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== 'form') return;
    setErr('');
    if (pw.length < 8) return setErr('Use at least 8 characters for your password.');
    if (pw !== pw2) return setErr('The passwords do not match.');
    setPhase('loading');
    void (async () => {
      const res = await completePasswordReset(pw);
      if (res.ok) setPhase('done');
      else {
        setErr(res.message);
        setPhase('form');
      }
    })();
  };

  if (phase === 'checking') {
    return <div className="min-h-[320px]" aria-busy="true" />;
  }

  if (phase === 'done') {
    return (
      <div role="status" className="flex flex-col items-center gap-[18px] py-6 text-center">
        <SuccessCheck />
        <h2 className="text-[28px] font-bold md:text-[32px]">Password updated</h2>
        <p className="max-w-[380px] text-[17px] leading-[1.6] text-muted">
          Your new password is saved. Use it from now on to log in.
        </p>
        <LinkButton href="/dashboard" size="xl" className="mt-2">
          Go to dashboard
        </LinkButton>
      </div>
    );
  }

  if (phase === 'expired') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[28px] leading-[1.2] font-bold md:text-[32px]">Link expired</h2>
          <p className="mt-2 text-[17px] text-muted">
            This password reset link is invalid or has expired. Request a fresh one and try again.
          </p>
        </div>
        <LinkButton href="/login" size="xl">
          Back to log in
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[28px] leading-[1.2] font-bold md:text-[32px]">Set a new password</h2>
        <p className="mt-2 text-[17px] text-muted">Pick something with at least 8 characters.</p>
      </div>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div>
          <Label tone="strong" htmlFor="npw">
            New password
          </Label>
          <Field
            id="npw"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={pw}
            invalid={Boolean(err)}
            onChange={(e) => {
              setPw(e.target.value);
              setErr('');
            }}
            className="mt-2"
          />
        </div>
        <div>
          <Label tone="strong" htmlFor="npw2">
            Confirm password
          </Label>
          <Field
            id="npw2"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={pw2}
            invalid={Boolean(err)}
            onChange={(e) => {
              setPw2(e.target.value);
              setErr('');
            }}
            className="mt-2"
          />
        </div>
        {err && <Alert tone="error">{err}</Alert>}
        <Button type="submit" size="xl" disabled={phase === 'loading'}>
          {phase === 'loading' ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
