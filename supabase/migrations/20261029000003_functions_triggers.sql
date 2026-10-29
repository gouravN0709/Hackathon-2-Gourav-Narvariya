-- Functions + triggers: profile auto-create with default plan seed, lift_history
-- view (computed lift history), and the deterministic regenerate_plan RPC (no AI).

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  insert into user_plan (user_id, dow, workout_key)
  values
    (new.id, 0, 'back'),
    (new.id, 1, 'legs'),
    (new.id, 3, 'chest'),
    (new.id, 4, 'shoulders')
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Lift history is computed from session_sets (top completed set per lift per date);
-- never stored in a separate table.
create or replace view lift_history as
select
  es.lift_key                      as lift,
  ws.user_id                       as user_id,
  ws.performed_on                  as logged_on,
  max(ss.kg)                       as kg
from workout_sessions ws
join session_sets ss on ss.session_id = ws.id
join exercises es    on es.key = ss.exercise_key
where ss.done
  and ss.reps > 0
  and es.lift_key is not null
group by 1, 2, 3;

-- Deterministic, rule-based plan regeneration (no AI):
-- rotation Mon->back, Tue->legs, Thu->chest, Fri->shoulders. Days earlier this week
-- that already have a logged session keep their scheduled workout; missed days are
-- dropped and the rotation is re-filled over the remaining weekdays.
create or replace function regenerate_plan(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  dow_now   int;
  rotation0 text[] := array['back', 'legs', 'chest', 'shoulders'];
  days      int[] := array[0, 1, 3, 4]; -- Mon, Tue, Thu, Fri default slots
  kept      user_plan%rowtype;
  i         int := 0;
  d         int;
begin
  if p_user is null or p_user <> auth.uid() then
    raise exception 'regenerate_plan: caller does not own the plan';
  end if;

  dow_now := (extract(dow from current_date)::int + 6) % 7; -- Monday = 0

  -- Over the weekend the week is finished: rebuild the full standard week.
  if dow_now >= 5 then
    delete from user_plan where user_id = p_user;
    insert into user_plan (user_id, dow, workout_key)
    select p_user, d, rot
    from unnest(array[0, 1, 3, 4], rotation0) as u(d, rot);
    return;
  end if;

  -- Keep scheduled days from earlier this week that already have a logged session.
  create temp table _kept_plan (dow int, workout_key text) on commit drop;
  insert into _kept_plan (dow, workout_key)
  select up.dow, up.workout_key
  from user_plan up
  where up.user_id = p_user
    and up.dow < dow_now
    and exists (
      select 1
      from workout_sessions s
      where s.user_id = up.user_id
        and s.workout_key = up.workout_key
        and s.performed_on >= current_date - dow_now  -- Monday of this week
        and s.performed_on <= current_date
    );

  delete from user_plan where user_id = p_user;

  insert into user_plan (user_id, dow, workout_key)
  select p_user, dow, workout_key from _kept_plan;

  -- Fill the remaining weekdays with the rotation, cycling if needed.
  for d in select generate_series(dow_now, 5) loop
    -- Monday stays back, Tuesday legs, otherwise continue the rotation.
    if exists (select 1 from _kept_plan where dow = d) then
      continue;
    end if;
    if d = 0 then
      insert into user_plan (user_id, dow, workout_key) values (p_user, d, 'back');
    elsif d = 1 then
      insert into user_plan (user_id, dow, workout_key) values (p_user, d, 'legs');
    elsif d = 3 then
      insert into user_plan (user_id, dow, workout_key) values (p_user, d, 'chest');
    elsif d = 4 then
      insert into user_plan (user_id, dow, workout_key) values (p_user, d, 'shoulders');
    else
      insert into user_plan (user_id, dow, workout_key)
        values (p_user, d, rotation0[i % 4 + 1]);
      i := i + 1;
    end if;
  end loop;
end;
$$;

grant execute on function regenerate_plan(uuid) to authenticated;
