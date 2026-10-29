-- Row Level Security: enabled on every table.
-- User tables: full CRUD only where user_id = auth.uid(). Catalogs: read for
-- authenticated, no client writes. feedback: insert for anyone, no read for clients.

alter table profiles          enable row level security;
alter table exercises         enable row level security;
alter table workouts          enable row level security;
alter table workout_exercises enable row level security;
alter table foods             enable row level security;
alter table weight_logs       enable row level security;
alter table user_plan         enable row level security;
alter table workout_extras    enable row level security;
alter table custom_routines   enable row level security;
alter table workout_sessions  enable row level security;
alter table session_sets      enable row level security;
alter table custom_foods      enable row level security;
alter table meal_entries      enable row level security;
alter table chat_messages     enable row level security;
alter table feedback          enable row level security;

-- Catalogs: read-only for authenticated users
create policy "catalog read" on exercises for select to authenticated using (true);
create policy "catalog read" on workouts for select to authenticated using (true);
create policy "catalog read" on workout_exercises for select to authenticated using (true);
create policy "catalog read" on foods for select to authenticated using (true);

-- Profiles: id = auth.uid()
create policy "own select" on profiles for select to authenticated using (id = auth.uid());
create policy "own insert" on profiles for insert to authenticated with check (id = auth.uid());
create policy "own update" on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Per-user tables: select/insert/update/delete only where user_id = auth.uid()
do $$
declare t text;
begin
  foreach t in array array['weight_logs', 'user_plan', 'workout_extras', 'custom_routines',
      'workout_sessions', 'custom_foods', 'meal_entries', 'chat_messages'] loop
    execute format('create policy "own select" on %I for select to authenticated using (user_id = auth.uid())', t);
    execute format('create policy "own insert" on %I for insert to authenticated with check (user_id = auth.uid())', t);
    execute format('create policy "own update" on %I for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    execute format('create policy "own delete" on %I for delete to authenticated using (user_id = auth.uid())', t);
  end loop;
end;
$$;

-- session_sets: owned via its own user_id column
create policy "own select" on session_sets for select to authenticated using (user_id = auth.uid());
create policy "own insert" on session_sets for insert to authenticated with check (user_id = auth.uid());
create policy "own update" on session_sets for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own delete" on session_sets for delete to authenticated using (user_id = auth.uid());

-- feedback: any authenticated user (and anon) may insert; nobody may read it back from the client
create policy "feedback insert" on feedback for insert to anon, authenticated with check (true);

-- The service role (postgres) bypasses RLS: used only by trusted server code (account delete).
