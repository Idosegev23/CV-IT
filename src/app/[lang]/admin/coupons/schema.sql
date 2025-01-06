create table public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  discount_percent numeric(5,2) default 0,
  discount_amount numeric(10,2) default 0,
  valid_until timestamp with time zone,
  max_uses integer not null default 1,
  current_uses integer not null default 0,
  created_at timestamp with time zone default now(),
  is_active boolean not null default true,
  features_included text[] default array[]::text[],
  created_by uuid references auth.users(id)
);

-- RLS Policies
alter table public.coupons enable row level security;

-- Allow admins to do everything
create policy "Admins can do everything on coupons"
  on public.coupons
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Allow all users to view active coupons
create policy "Users can view active coupons"
  on public.coupons
  for select
  to authenticated
  using (is_active = true);

-- Function to validate coupon
create or replace function public.validate_coupon(coupon_code text)
returns json
language plpgsql
security definer
as $$
declare
  coupon_record record;
  result json;
begin
  -- Get coupon details
  select * into coupon_record
  from public.coupons
  where code = coupon_code
  and is_active = true
  limit 1;

  -- Check if coupon exists
  if coupon_record is null then
    return json_build_object(
      'valid', false,
      'message', 'קופון לא קיים'
    );
  end if;

  -- Check if coupon has expired
  if coupon_record.valid_until is not null and coupon_record.valid_until < now() then
    return json_build_object(
      'valid', false,
      'message', 'קופון פג תוקף'
    );
  end if;

  -- Check if coupon has reached max uses
  if coupon_record.current_uses >= coupon_record.max_uses then
    return json_build_object(
      'valid', false,
      'message', 'קופון מיצה את מכסת השימושים'
    );
  end if;

  -- Return valid coupon details
  return json_build_object(
    'valid', true,
    'discount_percent', coupon_record.discount_percent,
    'discount_amount', coupon_record.discount_amount,
    'features_included', coupon_record.features_included
  );
end;
$$; 