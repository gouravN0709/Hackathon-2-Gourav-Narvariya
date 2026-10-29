'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { draftFrom, numOf, sameDraft, validateDraft, type NumericKey, type ProfileDraft } from '@/components/features/profile/profileDraft';
import { Alert, StatusText } from '@/components/ui/Alert';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Label } from '@/components/ui/Field';
import { Pill } from '@/components/ui/Pill';
import { ToggleRow } from '@/components/ui/Toggle';
import { Chip } from '@/components/ui/misc';
import { FeedbackModal } from '@/components/ui/FeedbackModal';
import { Icon } from '@/components/ui/Icon';
import { InfoTip } from '@/components/ui/InfoTip';
import { PageContainer, Stack } from '@/components/ui/Layout';
import { DIETS, EXPERIENCES, PROFILE_GOALS } from '@/lib/data/options';
import { calcTargets, latestWeight } from '@/lib/selectors';
import { useFitData, useFitStore } from '@/lib/store';
import { changePassword } from '@/lib/auth';
import { usePWA } from '@/lib/pwa/usePWA';
import { showToast } from '@/components/ui/Toast';
import { startAppTour } from '@/components/features/help/useTour';
import type { NotificationPrefs, User } from '@/types/domain';

const NOTIFICATIONS: { k: keyof NotificationPrefs; title: string; desc: string }[] = [
  { k: 'reminders', title: 'Workout reminders', desc: 'A nudge before your planned session.' },
  { k: 'weekly', title: 'Weekly summary', desc: 'Your progress report every Monday.' },
  { k: 'coach', title: 'Coach tips', desc: 'Short daily tips from Nova.' },
  { k: 'sounds', title: 'Interface sounds & haptics', desc: 'Soft ticks for set-complete, save, and toasts.' },
];

const MIN_PASSWORD = 8;
const DELETE_WORD = 'DELETE';

export function ProfileSettings() {
  const router = useRouter();
  const s = useFitData();
  const justDeleted = useFitStore((st) => st.justDeleted);
  const { saveUser, signOut, deleteAccount, reset, importFromDevice } = useFitStore.getState();

  const [d, setD] = useState<ProfileDraft>(() => draftFrom(useFitStore.getState()));
  const [err, setErr] = useState<{ error: string; field?: string }>({ error: '' });
  const [saved, setSaved] = useState(false);
  const [recalced, setRecalced] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwOk, setPwOk] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [importNote, setImportNote] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { isStandalone, canPrompt, isIosSafari, promptInstall } = usePWA();

  const base = draftFrom(s);
  const clean = sameDraft(d, base);

  useEffect(() => {
    if (clean) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [clean]);

  const edit = (patch: Partial<ProfileDraft>) => {
    setD((prev) => ({ ...prev, ...patch }));
    setErr({ error: '' });
    setSaved(false);
  };

  const discard = () => {
    setD(draftFrom(useFitStore.getState()));
    setErr({ error: '' });
    setRecalced(false);
  };

  const recalc = () => {
    const w = numOf(d, 'weight');
    const h = numOf(d, 'height');
    const a = numOf(d, 'age');
    if (!(w > 0 && h > 0 && a > 0)) {
      setErr({ error: 'Enter your age, height and weight first.' });
      return;
    }
    const t = calcTargets({ height: h, age: a, goal: d.goal }, w);
    setD((prev) => ({ ...prev, kcal: String(t.kcal), protein: String(t.protein), carbs: String(t.carbs), fats: String(t.fats) }));
    setRecalced(true);
    setErr({ error: '' });
    setSaved(false);
  };

  const save = () => {
    const result = validateDraft(d);
    if (result.error) {
      setErr(result);
      setSaved(false);
      return;
    }
    const state = useFitStore.getState();
    const w = numOf(d, 'weight');
    const patch: Partial<User> = {
      name: d.name.trim(),
      email: d.email.trim(),
      age: numOf(d, 'age'),
      height: numOf(d, 'height'),
      goalWeight: numOf(d, 'goalWeight'),
      goal: d.goal,
      exp: d.exp,
      diet: d.diet,
      notif: d.notif,
    };
    if (w !== latestWeight(state)) patch.startWeight = w;
    saveUser(patch, { kcal: numOf(d, 'kcal'), protein: numOf(d, 'protein'), carbs: numOf(d, 'carbs'), fats: numOf(d, 'fats') }, w);
    setSaved(true);
    setRecalced(false);
  };

  const togglePw = () => {
    setPwOpen((v) => !v);
    setPw1('');
    setPw2('');
    setPwErr('');
    setPwOk(false);
  };

  const submitPw = (e: FormEvent) => {
    e.preventDefault();
    if (pw1.length < MIN_PASSWORD) return setPwErr(`Password must be at least ${MIN_PASSWORD} characters.`);
    if (pw1 !== pw2) return setPwErr('Passwords do not match.');
    setPwErr('');
    void (async () => {
      const res = await changePassword(pw1);
      if (res.ok) {
        setPwOk(true);
        setPwErr('');
        setPw1('');
        setPw2('');
        setPwOpen(false);
      } else {
        setPwErr(res.message);
      }
    })();
  };

  const toggleNotif = (k: keyof NotificationPrefs) => {
    edit({ notif: { ...d.notif, [k]: !d.notif[k] } });
  };

  const logOut = () => {
    signOut();
    router.replace('/login');
  };

  const confirmDelete = () => {
    if (delText !== DELETE_WORD) return;
    void deleteAccount();
  };

  const resetDemo = () => {
    void reset().then(() => {
      setD(draftFrom(useFitStore.getState()));
      setErr({ error: '' });
      setSaved(false);
      setRecalced(false);
      setResetDone(true);
    });
  };

  const importDevice = () => {
    void importFromDevice().then((ok) => {
      setD(draftFrom(useFitStore.getState()));
      setImportNote(ok ? 'Imported the data from this device.' : 'No FitAI data found on this device.');
    });
  };

  if (justDeleted) {
    return (
      <PageContainer>
        <Card as="section" role="status" className="flex flex-col items-center gap-4 px-6 py-14 text-center md:px-8">
          <h2 className="text-[26px] font-bold md:text-[30px]">Account deleted</h2>
          <p className="max-w-[440px] text-[16px] leading-[1.55] text-muted">Your profile and logs have been removed. You can start fresh any time.</p>
          <LinkButton href="/login">Back to Log in</LinkButton>
        </Card>
      </PageContainer>
    );
  }

  const numField = (id: string, key: NumericKey, label: string, step?: string) => (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <Field
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        fieldSize="md"
        value={d[key]}
        invalid={err.field === key}
        onChange={(e) => edit({ [key]: e.target.value })}
      />
    </div>
  );

  const initial = base.name.charAt(0).toUpperCase();

  return (
    <PageContainer>
      <Stack gap={24}>
        <header className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4 md:gap-[18px]">
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 border-lime bg-active font-display text-[22px] font-bold text-lime md:h-[68px] md:w-[68px] md:text-[26px]">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-[26px] leading-[1.15] font-bold md:text-[32px]">Profile &amp; Settings</h1>
              <p className="mt-1.5 truncate text-[15px] text-muted md:text-[16px]">
                {d.name} · {d.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 max-md:w-full">
            {!clean && <Pill tone="amber">Unsaved changes</Pill>}
            <Button variant="ghost" onClick={discard} disabled={clean} className="max-md:flex-1" data-testid="profile-discard-button">
              Discard
            </Button>
            <Button onClick={save} disabled={clean} className="max-md:flex-1" data-testid="profile-save-button">
              Save changes
            </Button>
          </div>
        </header>

        {err.error && <Alert tone="error">{err.error}</Alert>}
        {saved && clean && (
          <Alert tone="success" check className="font-semibold">
            Changes saved. Your dashboard, nutrition targets and progress are updated.{' '}
            <Link href="/dashboard" className="underline">
              View dashboard
            </Link>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          <Stack gap={24}>
            <Section title="Fitness goal" subtitle="Nova builds your plan and targets around this." infoTopicId="profile-goal">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="group" aria-label="Fitness goal">
                {PROFILE_GOALS.map((o) => {
                  const on = d.goal === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => edit({ goal: o.id })}
                      className={clsx(
                        'flex flex-col gap-1.5 rounded-2xl border-[1.5px] p-4 text-left text-fg transition-colors duration-150',
                        on ? 'border-lime bg-lime-select' : 'border-line-chip bg-card hover:border-line-mute hover:bg-raised',
                      )}
                    >
                      <span className="font-display text-[17px] font-bold">{o.title}</span>
                      <span className="text-[13px] leading-[1.45] text-muted">{o.desc}</span>
                    </button>
                  );
                })}
              </div>
              <div className="max-w-[240px]">
                {numField('gw', 'goalWeight', 'Goal weight (kg)', '0.5')}
              </div>
            </Section>

            <Section title="Body details" subtitle="Changing your current weight logs it for today.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {numField('ag', 'age', 'Age')}
                {numField('hg', 'height', 'Height (cm)')}
                {numField('cw', 'weight', 'Current weight (kg)', '0.1')}
              </div>
            </Section>

            <Section title="Training & diet">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <p className="text-[13px] font-medium text-muted">Experience</p>
                    <InfoTip topicId="profile-experience" />
                  </div>
                  <div className="flex flex-wrap gap-2.5" role="group" aria-label="Experience">
                    {EXPERIENCES.map((o) => (
                      <Chip key={o.id} on={d.exp === o.id} onClick={() => edit({ exp: o.id })} className="h-11 px-[18px]">
                        {o.title}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2.5 flex items-center gap-1.5">
                    <p className="text-[13px] font-medium text-muted">Dietary preference</p>
                    <InfoTip topicId="profile-diet" />
                  </div>
                  <div className="flex flex-wrap gap-2.5" role="group" aria-label="Dietary preference">
                    {DIETS.map((o) => (
                      <Chip key={o.id} on={d.diet === o.id} onClick={() => edit({ diet: o.id })} className="h-11 px-[18px]">
                        {o.title}
                      </Chip>
                    ))}
                  </div>
                </div>
                <p className="text-[14px] text-muted">Training days: Mon, Tue, Thu, Fri (4 per week)</p>
              </div>
            </Section>

            <Section
              title="Daily targets"
              subtitle="Used on your dashboard, Nutrition and Nova's advice."
              infoTopicId="daily-targets-recalc"
              action={
                <Button variant="ghost" size="sm" onClick={recalc} data-testid="profile-recalc-button">
                  Recalculate with Nova
                </Button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {numField('tk', 'kcal', 'Calories (kcal)')}
                {numField('tp', 'protein', 'Protein (g)')}
                {numField('tc', 'carbs', 'Carbs (g)')}
                {numField('tf', 'fats', 'Fats (g)')}
              </div>
              {recalced && (
                <p role="status" className="text-[14px] text-violet-soft">
                  Nova suggested these targets from your goal, weight and activity. Save to apply them.
                </p>
              )}
            </Section>
          </Stack>

          <aside className="flex min-w-0 flex-col gap-6">
            <Card as="section" className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">Account</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="an" className="mb-2 block">
                    Full name
                  </Label>
                  <Field
                    id="an"
                    type="text"
                    autoComplete="name"
                    fieldSize="md"
                    value={d.name}
                    invalid={err.field === 'name'}
                    onChange={(e) => edit({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ae" className="mb-2 block">
                    Email
                  </Label>
                  <Field
                    id="ae"
                    type="email"
                    autoComplete="email"
                    fieldSize="md"
                    value={d.email}
                    invalid={err.field === 'email'}
                    onChange={(e) => edit({ email: e.target.value })}
                  />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={togglePw} aria-expanded={pwOpen} className="self-start">
                {pwOpen ? 'Cancel' : 'Change password'}
              </Button>
              {pwOpen && (
                <form onSubmit={submitPw} noValidate className="flex flex-col gap-4 border-t border-line pt-3">
                  <div>
                    <Label htmlFor="p1" className="mb-2 block">
                      New password
                    </Label>
                    <Field
                      id="p1"
                      type="password"
                      autoComplete="new-password"
                      fieldSize="md"
                      value={pw1}
                      onChange={(e) => {
                        setPw1(e.target.value);
                        setPwErr('');
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="p2" className="mb-2 block">
                      Confirm new password
                    </Label>
                    <Field
                      id="p2"
                      type="password"
                      autoComplete="new-password"
                      fieldSize="md"
                      value={pw2}
                      onChange={(e) => {
                        setPw2(e.target.value);
                        setPwErr('');
                      }}
                    />
                  </div>
                  {pwErr && <StatusText tone="error">{pwErr}</StatusText>}
                  <Button type="submit" size="sm" className="self-start">
                    Update password
                  </Button>
                </form>
              )}
              {pwOk && <StatusText tone="success">Password updated.</StatusText>}
            </Card>

            {!isStandalone && (
              <Card as="section" className="flex flex-col gap-4" data-testid="profile-install-card">
                <div>
                  <h2 className="text-[20px] font-bold">App</h2>
                  <p className="mt-1 text-[14px] text-muted">Install FitAI for fast access and offline workouts.</p>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-raised p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-lime text-on-lime">
                      <Icon name="bolt" size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold">Install app</p>
                      <p className="text-[13px] text-muted">
                        {isIosSafari
                          ? 'Tap Share, then Add to Home Screen'
                          : 'Fast home screen launch and full offline support'}
                      </p>
                    </div>
                  </div>
                  {canPrompt ? (
                    <Button
                      size="sm"
                      onClick={promptInstall}
                      data-testid="profile-install-app-button"
                    >
                      Install
                    </Button>
                  ) : isIosSafari ? (
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-lime">
                      <Icon name="share" size={16} strokeWidth={2} />
                      Share
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        showToast('To install, use your browser menu and choose "Add to Home Screen".', 'info');
                      }}
                      data-testid="profile-install-app-button"
                    >
                      Install
                    </Button>
                  )}
                </div>
              </Card>
            )}

            <Card as="section" className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[20px] font-bold">Notifications</h2>
                  <InfoTip topicId="profile-notifications" />
                </div>
                <p className="mt-1 text-[14px] text-muted">Choose what Nova alerts you about.</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {NOTIFICATIONS.map((n) => (
                  <ToggleRow
                    key={n.k}
                    checked={!!d.notif[n.k]}
                    onChange={() => toggleNotif(n.k)}
                    label={n.title}
                    description={n.desc}
                  />
                ))}
              </div>
            </Card>

            <Card as="section" className="flex flex-col gap-4" data-testid="profile-help-card">
              <div>
                <h2 className="text-[20px] font-bold">Help &amp; guide</h2>
                <p className="mt-1 text-[14px] text-muted">Guides, glossary, metric formulas, and tour.</p>
              </div>
              <div className="flex flex-col gap-2.5">
                <LinkButton href="/help" variant="ghost" className="justify-start gap-2.5">
                  <Icon name="help" size={18} />
                  Open Help Center
                </LinkButton>
                <Button
                  variant="ghost"
                  onClick={startAppTour}
                  data-testid="profile-restart-tour-button"
                  className="justify-start gap-2.5"
                >
                  <Icon name="sparkle" size={18} />
                  Restart app tour
                </Button>
              </div>
            </Card>

            <Card as="section" className="flex flex-col gap-4">
              <h2 className="text-[20px] font-bold">Session</h2>
              <div className="flex flex-col gap-2.5">
                <Button variant="ghost" onClick={logOut} data-testid="profile-logout-button">
                  Log out
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    aria-expanded={delOpen}
                    data-testid="profile-delete-open-button"
                    onClick={() => {
                      setDelOpen((v) => !v);
                      setDelText('');
                    }}
                    className="flex-1"
                  >
                    Delete account
                  </Button>
                  <InfoTip topicId="delete-account" />
                </div>
              </div>
              {delOpen && (
                <div className="flex flex-col gap-3 rounded-[14px] border border-danger-border bg-danger-deep p-4">
                  <p className="text-[14px] leading-[1.55] text-danger-soft">
                    This removes your profile, workouts, meals and weight history. Type DELETE to confirm.
                  </p>
                  <Field
                    type="text"
                    fieldSize="md"
                    aria-label="Type DELETE to confirm"
                    placeholder={DELETE_WORD}
                    autoComplete="off"
                    value={delText}
                    onChange={(e) => setDelText(e.target.value)}
                    className="placeholder:font-normal placeholder:text-placeholder"
                  />
                  <Button variant="danger" size="sm" onClick={confirmDelete} disabled={delText !== DELETE_WORD} data-testid="profile-delete-confirm-button">
                    Permanently delete
                  </Button>
                </div>
              )}
              <button
                type="button"
                onClick={resetDemo}
                data-testid="profile-reset-demo-button"
                className="min-h-11 self-start text-[13px] font-medium text-placeholder underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline md:min-h-0"
              >
                Reset demo data
              </button>
              {resetDone && <StatusText tone="success">Demo data restored to the original sample week.</StatusText>}

              <button
                type="button"
                onClick={importDevice}
                data-testid="profile-import-button"
                className="min-h-11 self-start text-[13px] font-medium text-placeholder underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline md:min-h-0"
              >
                Import data from this device
              </button>
              {importNote && <StatusText tone={importNote.startsWith('Imported') ? 'success' : 'error'}>{importNote}</StatusText>}

              <div className="border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-fg"
                >
                  <Icon name="info" size={16} strokeWidth={2} className="flex-none" />
                  <span>Report a problem / Request a feature</span>
                </button>
              </div>
            </Card>
          </aside>
        </div>
      </Stack>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </PageContainer>
  );
}

function Section({
  title,
  subtitle,
  action,
  infoTopicId,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  infoTopicId?: string;
  children: ReactNode;
}) {
  return (
    <Card as="section" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-[20px] font-bold">{title}</h2>
            {infoTopicId && <InfoTip topicId={infoTopicId} />}
          </div>
          {subtitle && <p className="mt-1 text-[14px] text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
