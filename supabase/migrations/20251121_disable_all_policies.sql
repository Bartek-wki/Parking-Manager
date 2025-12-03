-- migration: disable all row level security policies
-- purpose: removes all rls policies created in 20251121071324_create_parking_schema.sql
-- note: tables will still have rls enabled, but no policies will restrict access

begin;

-- drop locations policies
drop policy if exists locations_select_authenticated on public.locations;
drop policy if exists locations_select_anon on public.locations;
drop policy if exists locations_insert_authenticated on public.locations;
drop policy if exists locations_insert_anon on public.locations;
drop policy if exists locations_update_authenticated on public.locations;
drop policy if exists locations_update_anon on public.locations;
drop policy if exists locations_delete_authenticated on public.locations;
drop policy if exists locations_delete_anon on public.locations;

-- drop spots policies
drop policy if exists spots_select_authenticated on public.spots;
drop policy if exists spots_select_anon on public.spots;
drop policy if exists spots_insert_authenticated on public.spots;
drop policy if exists spots_insert_anon on public.spots;
drop policy if exists spots_update_authenticated on public.spots;
drop policy if exists spots_update_anon on public.spots;
drop policy if exists spots_delete_authenticated on public.spots;
drop policy if exists spots_delete_anon on public.spots;

-- drop clients policies
drop policy if exists clients_select_authenticated on public.clients;
drop policy if exists clients_select_anon on public.clients;
drop policy if exists clients_insert_authenticated on public.clients;
drop policy if exists clients_insert_anon on public.clients;
drop policy if exists clients_update_authenticated on public.clients;
drop policy if exists clients_update_anon on public.clients;
drop policy if exists clients_delete_authenticated on public.clients;
drop policy if exists clients_delete_anon on public.clients;

-- drop bookings policies
drop policy if exists bookings_select_authenticated on public.bookings;
drop policy if exists bookings_select_anon on public.bookings;
drop policy if exists bookings_insert_authenticated on public.bookings;
drop policy if exists bookings_insert_anon on public.bookings;
drop policy if exists bookings_update_authenticated on public.bookings;
drop policy if exists bookings_update_anon on public.bookings;
drop policy if exists bookings_delete_authenticated on public.bookings;
drop policy if exists bookings_delete_anon on public.bookings;

-- drop price_exceptions policies
drop policy if exists price_exceptions_select_authenticated on public.price_exceptions;
drop policy if exists price_exceptions_select_anon on public.price_exceptions;
drop policy if exists price_exceptions_insert_authenticated on public.price_exceptions;
drop policy if exists price_exceptions_insert_anon on public.price_exceptions;
drop policy if exists price_exceptions_update_authenticated on public.price_exceptions;
drop policy if exists price_exceptions_update_anon on public.price_exceptions;
drop policy if exists price_exceptions_delete_authenticated on public.price_exceptions;
drop policy if exists price_exceptions_delete_anon on public.price_exceptions;

-- drop payment_history policies
drop policy if exists payment_history_select_authenticated on public.payment_history;
drop policy if exists payment_history_select_anon on public.payment_history;
drop policy if exists payment_history_insert_authenticated on public.payment_history;
drop policy if exists payment_history_insert_anon on public.payment_history;
drop policy if exists payment_history_update_authenticated on public.payment_history;
drop policy if exists payment_history_update_anon on public.payment_history;
drop policy if exists payment_history_delete_authenticated on public.payment_history;
drop policy if exists payment_history_delete_anon on public.payment_history;

-- drop email_logs policies
drop policy if exists email_logs_select_authenticated on public.email_logs;
drop policy if exists email_logs_select_anon on public.email_logs;
drop policy if exists email_logs_insert_authenticated on public.email_logs;
drop policy if exists email_logs_insert_anon on public.email_logs;
drop policy if exists email_logs_update_authenticated on public.email_logs;
drop policy if exists email_logs_update_anon on public.email_logs;
drop policy if exists email_logs_delete_authenticated on public.email_logs;
drop policy if exists email_logs_delete_anon on public.email_logs;

commit;

