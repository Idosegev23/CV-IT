create table public.agencies (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  contact_person text,
  is_active boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  notes text,
  specialties text[],
  regions text[],
  send_cv_template jsonb
);

-- RLS Policies
alter table public.agencies enable row level security;

-- Allow admins to do everything
create policy "Admins can do everything on agencies"
  on public.agencies
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Function to get active agencies
create or replace function public.get_active_agencies()
returns setof agencies
language sql
security definer
as $$
  select *
  from public.agencies
  where is_active = true
  order by name asc;
$$; 