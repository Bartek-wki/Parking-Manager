-- migration: enable public access for development
-- purpose: allows full access to all tables for the 'anon' role (public) to facilitate local testing without auth
-- note: this should be disabled/reverted in production

begin;

-- locations
create policy "Enable all access for dev" on public.locations for all using (true) with check (true);

-- spots
create policy "Enable all access for dev" on public.spots for all using (true) with check (true);

-- clients
create policy "Enable all access for dev" on public.clients for all using (true) with check (true);

-- bookings
create policy "Enable all access for dev" on public.bookings for all using (true) with check (true);

-- price_exceptions
create policy "Enable all access for dev" on public.price_exceptions for all using (true) with check (true);

-- payment_history
create policy "Enable all access for dev" on public.payment_history for all using (true) with check (true);

-- email_logs
create policy "Enable all access for dev" on public.email_logs for all using (true) with check (true);

commit;

