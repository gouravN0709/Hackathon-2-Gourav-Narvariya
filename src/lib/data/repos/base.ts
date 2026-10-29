/** Typed data repositories over the Supabase client. Thin, side-effect-free. */

export interface RepoError {
  code: string;
  message: string;
}

export class RepoException extends Error implements RepoError {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'RepoException';
  }
}

export function toRepoError(err: unknown): RepoError {
  if (err instanceof RepoException) return { code: err.code, message: err.message };
  const e = err as { code?: string; message?: string };
  return {
    code: e?.code ?? 'unknown',
    message: e?.message ?? 'Something went wrong. Try again.',
  };
}

export async function unwrap<T>(
  run: () => PromiseLike<{ data: T | null; error: { code?: string; message?: string } | null }>,
  fallbackMessage = 'Something went wrong. Try again.',
): Promise<T> {
  const { data, error } = await run().then(async (r) => r, async (e: unknown) => ({ data: null, error: toRepoError(e) }));
  if (error) throw new RepoException(error.code ?? 'unknown', error.message ?? fallbackMessage);
  if (data == null) throw new RepoException('NO_DATA', fallbackMessage);
  return data;
}
