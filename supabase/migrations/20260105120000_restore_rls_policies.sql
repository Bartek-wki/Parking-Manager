-- migration: restore rls policies
-- purpose: reverts public access for dev and restores original rls policies defined in 20251121071324_create_parking_schema.sql
-- affected tables: locations, spots, clients, bookings, price_exceptions, payment_history, email_logs

begin;

-- drop dev policies (created in 20251203000000_enable_public_access_for_dev.sql)
drop policy if exists "Enable all access for dev" on public.locations;
drop policy if exists "Enable all access for dev" on public.spots;
drop policy if exists "Enable all access for dev" on public.clients;
drop policy if exists "Enable all access for dev" on public.bookings;
drop policy if exists "Enable all access for dev" on public.price_exceptions;
drop policy if exists "Enable all access for dev" on public.payment_history;
drop policy if exists "Enable all access for dev" on public.email_logs;

-- restore locations policies
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

-- restore spots policies
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

-- restore clients policies (select hides soft-deleted records)
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

-- restore bookings policies
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

-- restore price_exceptions policies
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

-- restore payment_history policies (read-only for tenants; inserts happen via trigger but still scoped)
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

-- restore email_logs policies
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

