'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button, LinkButton } from '@/components/ui/Button';
import { Field, Label } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { SuccessCheck } from '@/components/ui/misc';
import { useFitStore } from '@/lib/store';
import { requestPasswordReset, signInWithPassword, signUp } from '@/lib/auth';
import { isEmail } from '@/lib/validation';

type Mode = 'login' | 'signup';
type FieldKey = 'name' | 'email' | 'pw' | '';

export function LoginForm() {
  const first = useFitStore((s) => s.user.first);

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [terms, setTerms] = useState(false);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [bad, setBad] = useState<FieldKey>('');
  const [info, setInfo] = useState('');
  const [phase, setPhase] = useState<'form' | 'loading' | 'success'>('form');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const login = mode === 'login';

  const clearMessages = () => {
    setErr('');
    setBad('');
    setInfo('');
  };

  const fail = (message: string, field: FieldKey) => {
    setErr(message);
    setBad(field);
    setInfo('');
    if (field === 'name') document.getElementById('nm')?.focus();
    else if (field === 'email') document.getElementById('em')?.focus();
    else if (field === 'pw') document.getElementById('pw')?.focus();
  };

  const forgot = async () => {
    clearMessages();
    if (!isEmail(email)) {
      fail('Enter your email above first, then tap Forgot password.', 'email');
      return;
    }
    const res = await requestPasswordReset(email.trim());
    if (res.ok) {
      setInfo(`Reset link sent to ${email.trim()}. Check your inbox.`);
    } else {
      fail(res.message, '');
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (phase !== 'form') return;
    if (!login && !name.trim()) return fail('Enter your name.', 'name');
    if (!isEmail(email)) return fail('Enter a valid email address.', 'email');
    if (pw.length < 8)
      return fail(login ? 'Enter your password (8 or more characters).' : 'Use at least 8 characters for your password.', 'pw');
    if (!login && !terms) return fail('Please accept the terms to continue.', '');
    clearMessages();
    setPhase('loading');
    void (async () => {
      try {
        const res = login
          ? await signInWithPassword(email.trim(), pw)
          : await signUp(name.trim(), email.trim(), pw);
        if (!res.ok) {
          fail(res.message, res.message.includes("don't match") ? 'pw' : '');
          setPhase('form');
          return;
        }
        // Pull the account's data into the store before the success screen.
        await useFitStore.getState().bootstrap();
        setPhase('success');
      } catch {
        fail('Could not reach the server. Check your connection and try again.', '');
        setPhase('form');
      }
    })();
  };

  if (phase === 'success') {
    return (
      <div role="status" className="flex flex-col items-center gap-[18px] py-6 text-center">
        <SuccessCheck />
        <h2 className="text-[28px] font-bold md:text-[32px]">{login ? `Welcome back, ${first}!` : 'Account created'}</h2>
        <p className="max-w-[380px] text-[17px] leading-[1.6] text-muted">
          {login
            ? "Your dashboard is ready with today's workout and meals."
            : 'Next, tell us a little about yourself so Nova can build your plan.'}
        </p>
        <LinkButton href={login ? '/dashboard' : '/onboarding'} size="xl" className="mt-2">
          {login ? 'Go to dashboard' : 'Set up my profile'}
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl<Mode>
        label="Log in or sign up"
        size="xl"
        track="card"
        stretch
        value={mode}
        onChange={(m) => {
          setMode(m);
          clearMessages();
        }}
        options={[
          { value: 'login', label: 'Log in' },
          { value: 'signup', label: 'Sign up' },
        ]}
      />
      <div>
        <h2 className="text-[28px] leading-[1.2] font-bold md:text-[32px]">{login ? 'Welcome back' : 'Create your account'}</h2>
        <p className="mt-2 text-[17px] text-muted">
          {login ? 'Log in to pick up where you left off.' : 'Takes about a minute. Then Nova builds your plan.'}
        </p>
      </div>

      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        {!login && (
          <div>
            <Label tone="strong" htmlFor="nm">
              Full name
            </Label>
            <Field
              id="nm"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              value={name}
              invalid={bad === 'name'}
              onChange={(e) => {
                setName(e.target.value);
                clearMessages();
              }}
              className="mt-2"
            />
          </div>
        )}
        <div>
          <Label tone="strong" htmlFor="em">
            Email
          </Label>
          <Field
            id="em"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            invalid={bad === 'email'}
            onChange={(e) => {
              setEmail(e.target.value);
              clearMessages();
            }}
            className="mt-2"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <Label tone="strong" htmlFor="pw">
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-controls="pw"
              className="text-[14px] font-semibold text-lime hover:underline"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          <Field
            id="pw"
            type={show ? 'text' : 'password'}
            autoComplete={login ? 'current-password' : 'new-password'}
            placeholder={login ? 'Your password' : 'At least 8 characters'}
            value={pw}
            invalid={bad === 'pw'}
            onChange={(e) => {
              setPw(e.target.value);
              clearMessages();
            }}
            className="mt-2"
          />
        </div>
        {!login && (
          <label className="flex cursor-pointer items-start gap-3 text-[14px] leading-normal text-soft">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                clearMessages();
              }}
              className="m-0 h-[22px] w-[22px] flex-none accent-lime"
            />
            I agree to the Terms of Service and Privacy Policy. My fitness data stays private to my account.
          </label>
        )}
        {login && (
          <div className="flex justify-end">
            <button type="button" onClick={forgot} className="text-[14px] font-semibold text-lime hover:underline">
              Forgot password?
            </button>
          </div>
        )}
        {err && <Alert tone="error">{err}</Alert>}
        {info && <Alert tone="success">{info}</Alert>}
        <Button type="submit" size="xl" disabled={phase === 'loading'} data-testid="auth-submit">
          {phase === 'loading' ? (login ? 'Logging in…' : 'Creating account…') : login ? 'Log in' : 'Create account'}
        </Button>
      </form>
      <p className="text-center text-[14px] text-muted">Use your real email and a password with 8 or more characters. Password resets work too.</p>
    </div>
  );
}
