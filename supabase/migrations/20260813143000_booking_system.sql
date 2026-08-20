create extension if not exists btree_gist;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  check_in date not null,
  check_out date not null,
  guests smallint not null check (guests between 1 and 6),
  name text not null,
  email text not null,
  phone text,
  message text,
  estimated_total numeric not null default 0 check (estimated_total >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'expired', 'cancelled')),
  hold_expires_at timestamptz,
  owner_action_token_hash text not null,
  google_calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out > check_in)
);

alter table public.bookings enable row level security;

create or replace function public.set_booking_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_booking_updated_at();

alter table public.bookings drop constraint if exists bookings_no_active_overlap;
alter table public.bookings
  add constraint bookings_no_active_overlap
  exclude using gist (
    daterange(check_in, check_out, '[)') with &&
  ) where (status in ('pending', 'confirmed'));

create or replace function public.expire_stale_bookings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer;
begin
  update public.bookings
  set status = 'expired'
  where status = 'pending'
    and hold_expires_at is not null
    and hold_expires_at <= now();

  get diagnostics expired_count = row_count;
  return expired_count;
end;
$$;

create or replace function public.create_booking_request(
  p_reference text,
  p_check_in date,
  p_check_out date,
  p_guests smallint,
  p_name text,
  p_email text,
  p_phone text,
  p_message text,
  p_estimated_total numeric,
  p_hold_expires_at timestamptz,
  p_owner_action_token_hash text
)
returns setof public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking public.bookings;
begin
  perform public.expire_stale_bookings();

  insert into public.bookings (
    reference, check_in, check_out, guests, name, email, phone, message,
    estimated_total, status, hold_expires_at, owner_action_token_hash
  ) values (
    p_reference, p_check_in, p_check_out, p_guests, p_name, p_email,
    nullif(p_phone, ''), nullif(p_message, ''), p_estimated_total,
    'pending', p_hold_expires_at, p_owner_action_token_hash
  ) returning * into new_booking;

  return next new_booking;
end;
$$;

revoke all on table public.bookings from anon, authenticated;
revoke all on function public.create_booking_request(text, date, date, smallint, text, text, text, text, numeric, timestamptz, text) from public, anon, authenticated;
grant execute on function public.create_booking_request(text, date, date, smallint, text, text, text, text, numeric, timestamptz, text) to service_role;
revoke all on function public.expire_stale_bookings() from public, anon, authenticated;
grant execute on function public.expire_stale_bookings() to service_role;
