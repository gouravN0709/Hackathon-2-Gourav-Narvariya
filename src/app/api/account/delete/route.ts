import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const body = z.object({ confirm: z.literal('DELETE') });

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }
  const parsed = body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Confirmation missing.' }, { status: 400 });
  }

  const client = await createClient();
  const { data } = await client.auth.getUser();
  const user = data?.user;
  if (!user) {
    return NextResponse.json({ message: 'Your session ended. Log in to continue.' }, { status: 401 });
  }

  // env-only import — a missing service key fails loudly instead of deleting nothing.
  try {
    const admin = createAdminClient();
    // FKs hold ON DELETE CASCADE, so profile and all user rows go with the account.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (err) {
    console.warn('[FitAI] account deletion failed:', err);
    return NextResponse.json({ message: 'Could not delete your account. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
