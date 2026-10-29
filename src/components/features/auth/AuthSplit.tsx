import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Icon } from '@/components/ui/Icon';

interface AuthSplitProps {
  intro: string;
  bullets: string[];
  footer: string;
  /** max width of the form column (460 login, 560 onboarding) */
  formWidth: number;
  children: ReactNode;
}

/** Two-column auth shell: brand panel (1 1 460) + form (1 1 560). Below 820px the brand panel becomes a compact header. */
export function AuthSplit({ intro, bullets, footer, formWidth, children }: AuthSplitProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-app md:flex-row md:flex-wrap">
      <aside className="box-border flex min-w-0 flex-col gap-6 border-b border-line-side bg-sidebar px-5 py-6 md:flex-[1_1_460px] md:justify-between md:gap-10 md:border-r md:border-b-0 md:px-14 md:py-12">
        <Logo variant="auth" />
        <div className="flex flex-col gap-7">
          <h1 className="text-[30px] leading-[1.08] font-extrabold md:text-[52px]">
            Your Fitness.
            <br />
            Your Data.
            <br />
            <span className="text-lime">Your AI Coach.</span>
          </h1>
          <p className="hidden max-w-[440px] text-[18px] leading-[1.6] text-muted md:block">{intro}</p>
          <ul className="hidden flex-col gap-3.5 md:flex">
            {bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-[16px]">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-lime-tint text-lime">
                  <Icon name="check" size={16} strokeWidth={2.6} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="hidden text-[14px] text-muted md:block">{footer}</p>
      </aside>

      <main className="box-border flex min-w-0 flex-1 flex-col items-center justify-center px-5 py-8 md:flex-[1_1_560px] md:px-14 md:py-12">
        <div className="flex w-full flex-col gap-6" style={{ maxWidth: formWidth }}>
          {children}
        </div>
      </main>
    </div>
  );
}
