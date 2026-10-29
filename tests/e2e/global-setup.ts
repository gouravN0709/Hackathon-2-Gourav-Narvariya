import { execSync } from 'node:child_process';
import path from 'node:path';

/**
 * Reset the local Supabase database to migrations + catalogs, then re-apply the
 * demo account. Every test run starts from exactly the seed state the assertions
 * expect (weight 76.4 kg, 2 of 4 sessions, today's 1,640 kcal log, ...).
 */
export default function globalSetup(): void {
  if (process.env.FITAI_SKIP_DB_RESET === '1') return;
  const here = path.dirname(__filename);
  execSync('npx supabase db reset', { cwd: path.resolve(here, '..', '..'), stdio: 'inherit' });
  execSync('./supabase/apply-demo.sh', {
    cwd: path.resolve(here, '..', '..'),
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: process.env.SUPABASE_DB_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' },
  });
}
