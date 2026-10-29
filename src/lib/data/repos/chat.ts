import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ChatRow } from '@/lib/supabase/types';
import type { ChatMessage } from '@/types/domain';

export async function fetchChat(client: SupabaseClient<Database>, userId: string): Promise<ChatRow[]> {
  const { data, error } = await client
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertChat(
  client: SupabaseClient<Database>,
  userId: string,
  message: ChatMessage,
): Promise<ChatRow> {
  const { data, error } = await client
    .from('chat_messages')
    .insert({
      user_id: userId,
      role: message.ai ? 'ai' : 'user',
      text: message.text,
      card: Boolean(message.card),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Simple per-user rate limit: at most 30 inserts in the last hour. */
export async function chatInsertAllowed(client: SupabaseClient<Database>, userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count, error } = await client
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);
  if (error) return true; // fail open: RLS still scopes the write
  return (count ?? 0) < 30;
}
