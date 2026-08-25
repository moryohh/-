-- نظام المستوى والصدارة والتقييم الدوري لمنصة «نحن معك»
-- شغّل هذا الملف مرة واحدة في Supabase A > SQL Editor.
-- لا يحتوي هذا الملف على مفاتيح سرية.

create table if not exists public.competition_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  activity_day date not null default current_date,
  activity_minutes_today integer not null default 0,
  activity_points_today integer not null default 0,
  period_points integer not null default 0,
  period_start date not null default date '2026-01-01',
  period_correct integer not null default 0,
  period_answered integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists points integer not null default 0;
alter table public.profiles add column if not exists level integer not null default 1;
alter table public.competition_stats add column if not exists period_points integer not null default 0;

alter table public.competition_stats enable row level security;

drop policy if exists "Users can read their own competition stats" on public.competition_stats;
create policy "Users can read their own competition stats"
on public.competition_stats
for select to authenticated
using (auth.uid() = user_id);

-- الدوال التالية تعيد بنية مخرجات محدثة؛ حذف تعريفاتها القديمة يجعل إعادة التشغيل آمنة.
drop function if exists public.record_period_points(integer) cascade;
drop function if exists public.record_assessment_result(integer, integer) cascade;
drop function if exists public.record_activity_block() cascade;
drop function if exists public.get_my_competition_snapshot() cascade;

create or replace function public.competition_period_start(p_day date default current_date)
returns date
language sql
immutable
as $$
  select date '2026-01-01' + (((p_day - date '2026-01-01') / 15) * 15);
$$;

create or replace function public.competition_level_for_points(p_total integer)
returns integer
language plpgsql
immutable
as $$
declare
  v_total integer := greatest(coalesce(p_total, 0), 0);
  v_level integer := 1;
  v_requirement integer := 10;
begin
  while v_total >= v_requirement and v_level < 10000 loop
    v_total := v_total - v_requirement;
    v_level := v_level + 1;
    v_requirement := greatest(v_requirement + 1, ceil(v_requirement * 1.25)::integer);
  end loop;
  return v_level;
end;
$$;

create or replace function public.competition_rating_for(
  p_level integer,
  p_correct integer,
  p_answered integer
)
returns text
language plpgsql
immutable
as $$
declare
  v_accuracy numeric := case
    when coalesce(p_answered, 0) > 0
      then (greatest(coalesce(p_correct, 0), 0)::numeric / p_answered::numeric) * 100
    else 0
  end;
begin
  if coalesce(p_level, 1) < 6 then return 'bronze'; end if;
  if v_accuracy > 70 then return 'diamond'; end if;
  if v_accuracy >= 50 then return 'gold'; end if;
  if v_accuracy >= 25 then return 'silver'; end if;
  return 'bronze';
end;
$$;

create or replace function public.record_activity_block()
returns table (
  user_id uuid,
  level integer,
  points integer,
  activity_minutes_today integer,
  activity_points_today integer,
  period_points integer,
  period_correct integer,
  period_answered integer,
  accuracy_percent integer,
  rating_tier text,
  rating_visible boolean,
  period_start date,
  period_end date,
  rank bigint,
  participants bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_stats public.competition_stats%rowtype;
  v_period_start date := public.competition_period_start(current_date);
  v_add_point boolean := false;
  v_points integer;
  v_level integer;
begin
  if v_user_id is null then return; end if;

  insert into public.competition_stats (user_id, activity_day, activity_minutes_today, activity_points_today, period_start)
  values (v_user_id, current_date, 0, 0, v_period_start)
  on conflict (user_id) do nothing;

  select * into v_stats from public.competition_stats where competition_stats.user_id = v_user_id for update;

  if v_stats.activity_day <> current_date then
    v_stats.activity_day := current_date;
    v_stats.activity_minutes_today := 0;
    v_stats.activity_points_today := 0;
  end if;

  if v_stats.period_start <> v_period_start then
    v_stats.period_start := v_period_start;
    v_stats.period_points := 0;
    v_stats.period_correct := 0;
    v_stats.period_answered := 0;
  end if;

  if v_stats.activity_points_today < 5 then
    v_stats.activity_minutes_today := least(v_stats.activity_minutes_today + 5, 1440);
    v_stats.activity_points_today := v_stats.activity_points_today + 1;
    v_stats.period_points := v_stats.period_points + 1;
    v_add_point := true;
  end if;

  update public.competition_stats
  set activity_day = v_stats.activity_day,
      activity_minutes_today = v_stats.activity_minutes_today,
      activity_points_today = v_stats.activity_points_today,
      period_points = v_stats.period_points,
      period_start = v_stats.period_start,
      period_correct = v_stats.period_correct,
      period_answered = v_stats.period_answered,
      updated_at = now()
  where competition_stats.user_id = v_user_id;

  if v_add_point then
    update public.profiles
    set points = greatest(coalesce(points, 0), 0) + 1,
        level = public.competition_level_for_points(greatest(coalesce(points, 0), 0) + 1),
        updated_at = now()
    where id = v_user_id;
  end if;

  select greatest(coalesce(p.points, 0), 0), public.competition_level_for_points(greatest(coalesce(p.points, 0), 0))
  into v_points, v_level
  from public.profiles p
  where p.id = v_user_id;

  return query
  select s.user_id,
         coalesce(v_level, 1),
         coalesce(v_points, 0),
         s.activity_minutes_today,
         s.activity_points_today,
         s.period_points,
         s.period_correct,
         s.period_answered,
         case when s.period_answered > 0 then round((s.period_correct::numeric / s.period_answered::numeric) * 100)::integer else 0 end,
         public.competition_rating_for(coalesce(v_level, 1), s.period_correct, s.period_answered),
         coalesce(v_level, 1) >= 6,
         s.period_start,
         s.period_start + 14,
         ranked.rank,
         (select count(*) from public.profiles)
  from public.competition_stats s
  left join (
    select p2.id,
           dense_rank() over (order by greatest(coalesce(p2.points, 0), 0) desc, greatest(coalesce(p2.level, 1), 1) desc, p2.updated_at asc) as rank
    from public.profiles p2
  ) ranked on ranked.id = s.user_id
  where s.user_id = v_user_id;
end;
$$;

create or replace function public.record_assessment_result(
  p_correct_points integer,
  p_total_points integer
)
returns table (
  user_id uuid,
  level integer,
  points integer,
  activity_minutes_today integer,
  activity_points_today integer,
  period_points integer,
  period_correct integer,
  period_answered integer,
  accuracy_percent integer,
  rating_tier text,
  rating_visible boolean,
  period_start date,
  period_end date,
  rank bigint,
  participants bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_period_start date := public.competition_period_start(current_date);
  v_correct integer := greatest(least(coalesce(p_correct_points, 0), greatest(coalesce(p_total_points, 0), 0)), 0);
  v_total integer := greatest(least(coalesce(p_total_points, 0), 100000), 0);
begin
  if v_user_id is null or v_total = 0 then return; end if;

  insert into public.competition_stats (user_id, activity_day, period_start)
  values (v_user_id, current_date, v_period_start)
  on conflict (user_id) do nothing;

  update public.competition_stats
  set period_start = v_period_start,
      period_points = case when competition_stats.period_start = v_period_start then competition_stats.period_points + v_correct else v_correct end,
      period_correct = case when competition_stats.period_start = v_period_start then competition_stats.period_correct + v_correct else v_correct end,
      period_answered = case when competition_stats.period_start = v_period_start then competition_stats.period_answered + v_total else v_total end,
      updated_at = now()
  where competition_stats.user_id = v_user_id;

  return query select * from public.get_my_competition_snapshot();
end;
$$;

create or replace function public.get_competition_leaderboard(p_limit integer default 20)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  avatar_url text,
  level integer,
  points integer,
  rating_tier text,
  accuracy_percent integer,
  period_correct integer,
  period_answered integer,
  is_current_user boolean
)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      dense_rank() over (
        order by greatest(coalesce(p.points, 0), 0) desc,
                 greatest(coalesce(p.level, 1), 1) desc,
                 p.updated_at asc
      ) as ranking,
      p.id,
      coalesce(nullif(p.full_name, ''), 'طالب المنصة') as display_name,
      p.avatar_url,
      greatest(coalesce(p.level, 1), 1) as level,
      greatest(coalesce(p.points, 0), 0) as points,
      coalesce(s.period_correct, 0) as period_correct,
      coalesce(s.period_answered, 0) as period_answered
    from public.profiles p
    left join public.competition_stats s on s.user_id = p.id
  )
  select
    r.ranking,
    r.id,
    r.display_name,
    r.avatar_url,
    r.level,
    r.points,
    public.competition_rating_for(r.level, r.period_correct, r.period_answered),
    case when r.period_answered > 0 then round((r.period_correct::numeric / r.period_answered::numeric) * 100)::integer else 0 end,
    r.period_correct,
    r.period_answered,
    r.id = auth.uid()
  from ranked r
  order by r.ranking asc, r.points desc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

create or replace function public.get_my_competition_snapshot()
returns table (
  user_id uuid,
  level integer,
  points integer,
  activity_minutes_today integer,
  activity_points_today integer,
  period_points integer,
  period_correct integer,
  period_answered integer,
  accuracy_percent integer,
  rating_tier text,
  rating_visible boolean,
  period_start date,
  period_end date,
  rank bigint,
  participants bigint
)
language sql
security definer
set search_path = public
as $$
  with ranked as (
    select
      dense_rank() over (
        order by greatest(coalesce(p.points, 0), 0) desc,
                 greatest(coalesce(p.level, 1), 1) desc,
                 p.updated_at asc
      ) as ranking,
      p.id,
      greatest(coalesce(p.level, 1), 1) as level,
      greatest(coalesce(p.points, 0), 0) as points,
      coalesce(s.activity_minutes_today, 0) as activity_minutes_today,
      coalesce(s.activity_points_today, 0) as activity_points_today,
      coalesce(s.period_points, 0) as period_points,
      coalesce(s.period_correct, 0) as period_correct,
      coalesce(s.period_answered, 0) as period_answered,
      coalesce(s.period_start, public.competition_period_start(current_date)) as period_start
    from public.profiles p
    left join public.competition_stats s on s.user_id = p.id
  )
  select
    r.id,
    r.level,
    r.points,
    r.activity_minutes_today,
    r.activity_points_today,
    r.period_points,
    r.period_correct,
    r.period_answered,
    case when r.period_answered > 0 then round((r.period_correct::numeric / r.period_answered::numeric) * 100)::integer else 0 end,
    public.competition_rating_for(r.level, r.period_correct, r.period_answered),
    r.level >= 6,
    r.period_start,
    r.period_start + 14,
    r.ranking,
    (select count(*) from public.profiles)
  from ranked r
  where r.id = auth.uid();
$$;

create or replace function public.record_period_points(p_points integer)
returns table (
  user_id uuid,
  level integer,
  points integer,
  activity_minutes_today integer,
  activity_points_today integer,
  period_points integer,
  period_correct integer,
  period_answered integer,
  accuracy_percent integer,
  rating_tier text,
  rating_visible boolean,
  period_start date,
  period_end date,
  rank bigint,
  participants bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_period_start date := public.competition_period_start(current_date);
  v_points integer := greatest(least(coalesce(p_points, 0), 100000), 0);
begin
  if v_user_id is null or v_points = 0 then return; end if;

  insert into public.competition_stats (user_id, activity_day, period_start)
  values (v_user_id, current_date, v_period_start)
  on conflict (user_id) do nothing;

  update public.competition_stats
  set period_points = case when competition_stats.period_start = v_period_start then competition_stats.period_points + v_points else v_points end,
      period_start = v_period_start,
      period_correct = case when competition_stats.period_start = v_period_start then competition_stats.period_correct else 0 end,
      period_answered = case when competition_stats.period_start = v_period_start then competition_stats.period_answered else 0 end,
      updated_at = now()
  where competition_stats.user_id = v_user_id;

  return query select * from public.get_my_competition_snapshot();
end;
$$;

revoke all on function public.record_activity_block() from public;
revoke all on function public.record_assessment_result(integer, integer) from public;
revoke all on function public.get_competition_leaderboard(integer) from public;
revoke all on function public.get_my_competition_snapshot() from public;
revoke all on function public.record_period_points(integer) from public;

grant execute on function public.record_activity_block() to authenticated;
grant execute on function public.record_assessment_result(integer, integer) to authenticated;
grant execute on function public.get_competition_leaderboard(integer) to authenticated;
grant execute on function public.get_my_competition_snapshot() to authenticated;
grant execute on function public.record_period_points(integer) to authenticated;
