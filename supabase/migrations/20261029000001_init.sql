-- FitAI schema init
-- All user tables reference auth.users ON DELETE CASCADE; mutable tables get updated_at
-- maintained by the set_updated_at trigger. Catalog tables (read-only for clients) first,
-- because user tables reference them.

create extension if not exists "pgcrypto";

-- ───────────────────────────── Catalogs ─────────────────────────────
create table exercises (
  key text primary key,
  name text not null,
  muscle text not null default '',
  muscle_group text not null default '',
  default_sets int not null default 3 check (default_sets >= 0),
  default_reps int not null default 10 check (default_reps >= 0),
  default_kg numeric not null default 0 check (default_kg >= 0),
  rest_seconds int not null default 60,
  step numeric not null default 2.5,
  tip text not null default '',
  lift_key text check (lift_key in ('bench', 'squat', 'row'))
);

create table workouts (
  key text primary key,
  name text not null,
  minutes int not null default 0 check (minutes >= 0),
  kcal int not null default 0 check (kcal >= 0),
  focus text[] not null default '{}'
);

create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_key text not null references workouts (key) on delete cascade,
  exercise_key text not null references exercises (key) on delete cascade,
  position int not null default 0,
  unique (workout_key, exercise_key)
);

create table foods (
  key text primary key,
  name text not null,
  cat text not null default 'Protein',
  base text not null default '100 g',
  kcal numeric not null default 0 check (kcal >= 0),
  protein numeric not null default 0 check (protein >= 0),
  carbs numeric not null default 0 check (carbs >= 0),
  fats numeric not null default 0 check (fats >= 0),
  servings jsonb not null default '[]'::jsonb,
  default_index int not null default 0
);

-- ───────────────────────────── Profiles ─────────────────────────────
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  age int not null default 28 check (age between 14 and 100),
  height_cm numeric not null default 178 check (height_cm between 120 and 230),
  goal text not null default 'muscle' check (goal in ('muscle', 'fat', 'maintain')),
  experience text not null default 'intermediate'
    check (experience in ('beginner', 'intermediate', 'advanced')),
  diet text not null default 'vegetarian'
    check (diet in ('vegetarian', 'vegan', 'eggetarian', 'nonveg', 'none')),
  start_weight numeric not null default 72 check (start_weight between 30 and 300),
  goal_weight numeric not null default 80 check (goal_weight between 30 and 300),
  current_weight numeric check (current_weight between 30 and 300),
  units text not null default 'metric' check (units in ('metric', 'imperial')),
  target_kcal int not null default 2400 check (target_kcal >= 0),
  target_protein int not null default 160 check (target_protein >= 0),
  target_carbs int not null default 280 check (target_carbs >= 0),
  target_fats int not null default 72 check (target_fats >= 0),
  notif_reminders boolean not null default true,
  notif_weekly boolean not null default true,
  notif_coach boolean not null default false,
  onboarding_completed boolean not null default false,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────────── User data ────────────────────────────
create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null,
  kg numeric(5, 1) not null check (kg between 30 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index weight_logs_user_day_uq on weight_logs (user_id, logged_on);
create index weight_logs_user_day_idx on weight_logs (user_id, logged_on desc);

create table user_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dow int not null check (dow between 0 and 6),
  workout_key text not null references workouts (key) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dow)
);

create table workout_extras (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_key text not null references workouts (key) on delete cascade,
  exercise_key text not null references exercises (key) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workout_key, exercise_key)
);

create table custom_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  exercise_keys text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  performed_on date not null,
  workout_key text not null references workouts (key) on delete cascade,
  name text not null,
  minutes int not null default 0 check (minutes >= 0),
  volume_kg numeric not null default 0 check (volume_kg >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index workout_sessions_user_day_uq on workout_sessions (user_id, performed_on, workout_key);
create index workout_sessions_user_day_idx on workout_sessions (user_id, performed_on desc);

create table session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references workout_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_key text not null references exercises (key) on delete cascade,
  set_no int not null check (set_no >= 1),
  kg numeric(6, 2) not null default 0 check (kg >= 0),
  reps int not null check (reps >= 0),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index session_sets_session_idx on session_sets (session_id, set_no);

create table custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  cat text not null default 'Snacks',
  base text not null default '100 g',
  kcal numeric not null default 0 check (kcal >= 0),
  protein numeric not null default 0 check (protein >= 0),
  carbs numeric not null default 0 check (carbs >= 0),
  fats numeric not null default 0 check (fats >= 0),
  servings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null,
  meal text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snacks')),
  name text not null,
  serving_label text not null default '',
  servings numeric not null default 1 check (servings >= 0.5),
  kcal numeric not null default 0 check (kcal >= 0),
  protein numeric not null default 0 check (protein >= 0),
  carbs numeric not null default 0 check (carbs >= 0),
  fats numeric not null default 0 check (fats >= 0),
  food_key text references foods (key) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index meal_entries_user_day_idx on meal_entries (user_id, logged_on desc);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('ai', 'user')),
  text text not null,
  card boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index chat_messages_user_created_idx on chat_messages (user_id, created_at);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  type text not null check (type in ('bug', 'idea')),
  message text not null,
  email text not null default '',
  created_at timestamptz not null default now()
);

-- ───────────────────────────── Triggers ─────────────────────────────
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles', 'weight_logs', 'user_plan', 'workout_extras',
      'custom_routines', 'workout_sessions', 'meal_entries', 'chat_messages'] loop
    execute format('drop trigger if exists trg_%s_updated_at on %I', t, t);
    execute format('create trigger trg_%s_updated_at before update on %I
                    for each row execute function set_updated_at()', t, t);
  end loop;
end;
$$;
