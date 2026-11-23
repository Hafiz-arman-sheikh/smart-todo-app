-- Run this script in Supabase Dashboard -> SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) between 1 and 100),
  description text,
  category text not null default 'Personal' check (category in ('Personal','Work','Study','Health','Shopping','Other')),
  priority text not null default 'Medium' check (priority in ('Low','Medium','High','Urgent')),
  status text not null default 'To Do' check (status in ('To Do','In Progress','Completed')),
  due_date date,
  due_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_user_due_date_idx on public.tasks(user_id, due_date);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);

alter table public.tasks enable row level security;

drop policy if exists "Users can read their own tasks" on public.tasks;
create policy "Users can read their own tasks" on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks" on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks" on public.tasks
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks" on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Keep updated_at current even when a client forgets to send it.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

-- Explicit table grants for authenticated PostgREST requests.
grant select, insert, update, delete on public.tasks to authenticated;
revoke all on public.tasks from anon;
grant usage on schema public to authenticated;
