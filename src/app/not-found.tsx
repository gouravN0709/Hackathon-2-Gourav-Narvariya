import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-app px-5 text-center text-fg">
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-[72px] font-black text-lime">404</span>
        <h1 className="text-[28px] font-bold md:text-[32px]">Page not found</h1>
        <p className="max-w-[420px] text-[16px] text-muted">
          The page you were looking for doesn&apos;t exist or was moved.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-lime px-6 text-[15px] font-semibold text-on-lime transition-all duration-150 hover:bg-lime-hover"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
