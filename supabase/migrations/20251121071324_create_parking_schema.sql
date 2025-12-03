-- migration: create parking manager schema (generated 2025-11-21t07:13:24z)
-- purpose: establishes core parking data model, domain enums, auditing triggers, row level security, and supporting indexes.
-- affected entities: reservation_type, reservation_status, payment_status, locations, spots, clients, bookings, price_exceptions, payment_history, email_logs, clients_soft_delete_hide, bookings_payment_status_audit.
-- notes: all sql uses lower-case, new tables immediately enable rls, and policies explicitly cover anon/authenticated roles.

begin;

-- ensure uuid generation and gist operator classes needed for range indexes.
create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

do $$
begin
    -- uses exception block because some postgres versions lack create type if not exists.
    create type public.reservation_type as enum ('permanent', 'periodic');
exception
    when duplicate_object then
        null;
end;
$$;

do $$
begin
    create type public.reservation_status as enum ('aktywna', 'zakonczona', 'zalegla');
exception
    when duplicate_object then
        null;
end;
$$;

do $$
begin
    create type public.payment_status as enum ('oplacone', 'nieoplacone');
exception
    when duplicate_object then
        null;
end;
$$;

-- locations owned by supabase auth users.
create table if not exists public.locations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    name varchar(255) not null,
    daily_rate numeric(10, 2) not null check (daily_rate >= 0),
    monthly_rate numeric(10, 2) not null check (monthly_rate >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint locations_user_name_chk check (char_length(trim(name)) > 0),
    unique (id, user_id)
);

-- parking spots scoped by location with composite ownership fks for rls efficiency.
create table if not exists public.spots (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    location_id uuid not null references public.locations (id) on update cascade on delete cascade,
    spot_number varchar(64) not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (location_id, spot_number),
    unique (id, user_id),
    unique (id, location_id),
    foreign key (location_id, user_id) references public.locations (id, user_id) on update cascade on delete cascade
);

-- clients represent vehicle owners; email validated when provided.
create table if not exists public.clients (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    first_name varchar(120) not null,
    last_name varchar(120) not null,
    email varchar(255),
    phone varchar(255),
    deleted_at timestamptz null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (email is null or email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    unique (id, user_id)
);

-- bookings connect clients to specific spots/locations and track billing lifecycle.
create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    client_id uuid not null references public.clients (id) on update cascade on delete restrict,
    spot_id uuid not null references public.spots (id) on update cascade on delete restrict,
    location_id uuid not null references public.locations (id) on update cascade on delete restrict,
    start_date date not null,
    end_date date null,
    type public.reservation_type not null,
    status public.reservation_status not null default 'aktywna',
    payment_status public.payment_status not null default 'nieoplacone',
    cost numeric(10, 2) null check (cost is null or cost >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (end_date is null or end_date >= start_date),
    check (type <> 'periodic' or end_date is not null),
    foreign key (client_id, user_id) references public.clients (id, user_id) on update cascade on delete restrict,
    foreign key (spot_id, user_id) references public.spots (id, user_id) on update cascade on delete restrict,
    foreign key (spot_id, location_id) references public.spots (id, location_id) on update cascade on delete restrict,
    foreign key (location_id, user_id) references public.locations (id, user_id) on update cascade on delete restrict,
    unique (id, user_id)
);

-- percentage overrides per location and period.
create table if not exists public.price_exceptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    location_id uuid not null references public.locations (id) on update cascade on delete cascade,
    start_date date not null,
    end_date date not null,
    percentage_change numeric(6, 2) not null check (percentage_change between -100.00 and 500.00),
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (end_date >= start_date),
    unique (location_id, start_date, end_date),
    foreign key (location_id, user_id) references public.locations (id, user_id) on update cascade on delete cascade
);

-- payment history captures every payment status change for auditing and notifications.
create table if not exists public.payment_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    booking_id uuid not null references public.bookings (id) on update cascade on delete cascade,
    previous_status public.payment_status not null,
    new_status public.payment_status not null,
    changed_at timestamptz not null default now(),
    changed_by uuid not null references auth.users (id),
    foreign key (booking_id, user_id) references public.bookings (id, user_id) on update cascade on delete cascade
);

-- outbound communication logs for reminders, overdue notices, and confirmations.
create table if not exists public.email_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id),
    booking_id uuid null references public.bookings (id) on update cascade on delete set null,
    type varchar(32) not null check (type in ('reminder', 'overdue', 'confirmation')),
    status varchar(16) not null check (status in ('sent', 'failed')),
    recipients jsonb not null,
    error_message text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    foreign key (booking_id, user_id) references public.bookings (id, user_id) on update cascade on delete set null
);

-- indexes supporting tenancy filters, lookups, and calendar collision checks.
create index if not exists locations_user_id_idx on public.locations (user_id);

create index if not exists spots_user_id_idx on public.spots (user_id);
create index if not exists spots_location_id_idx on public.spots (location_id);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists clients_email_lower_idx on public.clients (lower(email));
create index if not exists clients_active_id_partial_idx on public.clients (id) where deleted_at is null;

create index if not exists bookings_spot_range_gist_idx on public.bookings using gist (
    spot_id,
    daterange(start_date, coalesce(end_date, start_date + 1), '[]')
);
create index if not exists bookings_location_range_gist_idx on public.bookings using gist (
    location_id,
    daterange(start_date, coalesce(end_date, start_date + 1), '[]')
);
create index if not exists bookings_user_id_idx on public.bookings (user_id);
create index if not exists bookings_location_id_idx on public.bookings (location_id);
create index if not exists bookings_client_id_idx on public.bookings (client_id);
create index if not exists bookings_spot_id_idx on public.bookings (spot_id);
create index if not exists bookings_active_spot_start_idx on public.bookings (spot_id, start_date) where status = 'aktywna';

create index if not exists price_exceptions_user_id_idx on public.price_exceptions (user_id);
create index if not exists price_exceptions_location_id_idx on public.price_exceptions (location_id);

create index if not exists payment_history_user_id_idx on public.payment_history (user_id);
create index if not exists payment_history_booking_changed_at_idx on public.payment_history (booking_id, changed_at desc);

create index if not exists email_logs_user_id_idx on public.email_logs (user_id);
create index if not exists email_logs_created_type_status_idx on public.email_logs (created_at desc, type, status);
create index if not exists email_logs_booking_id_idx on public.email_logs (booking_id);

-- soft delete trigger keeps client history while preventing destructive deletes.
create or replace function public.clients_soft_delete_hide()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.clients
    set deleted_at = coalesce(deleted_at, now()),
        updated_at = now()
    where id = old.id;

    -- cancel the physical delete while marking the row as hidden.
    return null;
end;
$$;

create trigger clients_soft_delete_hide
before delete on public.clients
for each row
execute function public.clients_soft_delete_hide();

-- audit trigger logs every payment status change for downstream notifications.
create or replace function public.bookings_payment_status_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_previous public.payment_status;
    v_new public.payment_status;
begin
    if tg_op = 'insert' then
        v_previous := new.payment_status;
        v_new := new.payment_status;
    elsif tg_op = 'update' then
        if not (new.payment_status is distinct from old.payment_status) then
            return new;
        end if;
        v_previous := old.payment_status;
        v_new := new.payment_status;
    else
        return new;
    end if;

    insert into public.payment_history (user_id, booking_id, previous_status, new_status, changed_by)
    values (
        new.user_id,
        new.id,
        v_previous,
        v_new,
        coalesce(auth.uid(), new.user_id)
    );

    return new;
end;
$$;

create trigger bookings_payment_status_audit
after insert or update of payment_status on public.bookings
for each row
execute function public.bookings_payment_status_audit();

-- enable row level security immediately after table creation for defense-in-depth.
alter table public.locations enable row level security;
alter table public.spots enable row level security;
alter table public.clients enable row level security;
alter table public.bookings enable row level security;
alter table public.price_exceptions enable row level security;
alter table public.payment_history enable row level security;
alter table public.email_logs enable row level security;

-- locations policies.
create policy locations_select_authenticated on public.locations
    for select
    to authenticated
    using (user_id = auth.uid());

create policy locations_select_anon on public.locations
    for select
    to anon
    using (false);

create policy locations_insert_authenticated on public.locations
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy locations_insert_anon on public.locations
    for insert
    to anon
    with check (false);

create policy locations_update_authenticated on public.locations
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy locations_update_anon on public.locations
    for update
    to anon
    using (false)
    with check (false);

create policy locations_delete_authenticated on public.locations
    for delete
    to authenticated
    using (user_id = auth.uid());

create policy locations_delete_anon on public.locations
    for delete
    to anon
    using (false);

-- spots policies.
create policy spots_select_authenticated on public.spots
    for select
    to authenticated
    using (user_id = auth.uid());

create policy spots_select_anon on public.spots
    for select
    to anon
    using (false);

create policy spots_insert_authenticated on public.spots
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy spots_insert_anon on public.spots
    for insert
    to anon
    with check (false);

create policy spots_update_authenticated on public.spots
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy spots_update_anon on public.spots
    for update
    to anon
    using (false)
    with check (false);

create policy spots_delete_authenticated on public.spots
    for delete
    to authenticated
    using (user_id = auth.uid());

create policy spots_delete_anon on public.spots
    for delete
    to anon
    using (false);

-- clients policies (select hides soft-deleted records).
create policy clients_select_authenticated on public.clients
    for select
    to authenticated
    using (user_id = auth.uid() and deleted_at is null);

create policy clients_select_anon on public.clients
    for select
    to anon
    using (false);

create policy clients_insert_authenticated on public.clients
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy clients_insert_anon on public.clients
    for insert
    to anon
    with check (false);

create policy clients_update_authenticated on public.clients
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy clients_update_anon on public.clients
    for update
    to anon
    using (false)
    with check (false);

create policy clients_delete_authenticated on public.clients
    for delete
    to authenticated
    using (user_id = auth.uid());

create policy clients_delete_anon on public.clients
    for delete
    to anon
    using (false);

-- bookings policies.
create policy bookings_select_authenticated on public.bookings
    for select
    to authenticated
    using (user_id = auth.uid());

create policy bookings_select_anon on public.bookings
    for select
    to anon
    using (false);

create policy bookings_insert_authenticated on public.bookings
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy bookings_insert_anon on public.bookings
    for insert
    to anon
    with check (false);

create policy bookings_update_authenticated on public.bookings
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy bookings_update_anon on public.bookings
    for update
    to anon
    using (false)
    with check (false);

create policy bookings_delete_authenticated on public.bookings
    for delete
    to authenticated
    using (user_id = auth.uid());

create policy bookings_delete_anon on public.bookings
    for delete
    to anon
    using (false);

-- price exceptions policies.
create policy price_exceptions_select_authenticated on public.price_exceptions
    for select
    to authenticated
    using (user_id = auth.uid());

create policy price_exceptions_select_anon on public.price_exceptions
    for select
    to anon
    using (false);

create policy price_exceptions_insert_authenticated on public.price_exceptions
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy price_exceptions_insert_anon on public.price_exceptions
    for insert
    to anon
    with check (false);

create policy price_exceptions_update_authenticated on public.price_exceptions
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy price_exceptions_update_anon on public.price_exceptions
    for update
    to anon
    using (false)
    with check (false);

create policy price_exceptions_delete_authenticated on public.price_exceptions
    for delete
    to authenticated
    using (user_id = auth.uid());

create policy price_exceptions_delete_anon on public.price_exceptions
    for delete
    to anon
    using (false);

-- payment history policies (read-only for tenants; inserts happen via trigger but still scoped).
create policy payment_history_select_authenticated on public.payment_history
    for select
    to authenticated
    using (user_id = auth.uid());

create policy payment_history_select_anon on public.payment_history
    for select
    to anon
    using (false);

create policy payment_history_insert_authenticated on public.payment_history
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy payment_history_insert_anon on public.payment_history
    for insert
    to anon
    with check (false);

create policy payment_history_update_authenticated on public.payment_history
    for update
    to authenticated
    using (false)
    with check (false);

create policy payment_history_update_anon on public.payment_history
    for update
    to anon
    using (false)
    with check (false);

create policy payment_history_delete_authenticated on public.payment_history
    for delete
    to authenticated
    using (false);

create policy payment_history_delete_anon on public.payment_history
    for delete
    to anon
    using (false);

-- email log policies.
create policy email_logs_select_authenticated on public.email_logs
    for select
    to authenticated
    using (user_id = auth.uid());

create policy email_logs_select_anon on public.email_logs
    for select
    to anon
    using (false);

create policy email_logs_insert_authenticated on public.email_logs
    for insert
    to authenticated
    with check (user_id = auth.uid());

create policy email_logs_insert_anon on public.email_logs
    for insert
    to anon
    with check (false);

create policy email_logs_update_authenticated on public.email_logs
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy email_logs_update_anon on public.email_logs
    for update
    to anon
    using (false)
    with check (false);

create policy email_logs_delete_authenticated on public.email_logs
    for delete
    to authenticated
    using (user_id = auth.uid());

create policy email_logs_delete_anon on public.email_logs
    for delete
    to anon
    using (false);

commit;

