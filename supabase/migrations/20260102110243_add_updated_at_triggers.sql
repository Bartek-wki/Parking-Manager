-- Add triggers to automatically update updated_at column for all tables
-- This ensures updated_at is always set when a row is modified

begin;

-- Function to update updated_at column
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Add triggers for all tables with updated_at column
create trigger update_locations_updated_at
    before update on public.locations
    for each row
    execute function public.update_updated_at_column();

create trigger update_spots_updated_at
    before update on public.spots
    for each row
    execute function public.update_updated_at_column();

create trigger update_clients_updated_at
    before update on public.clients
    for each row
    execute function public.update_updated_at_column();

create trigger update_bookings_updated_at
    before update on public.bookings
    for each row
    execute function public.update_updated_at_column();

create trigger update_price_exceptions_updated_at
    before update on public.price_exceptions
    for each row
    execute function public.update_updated_at_column();

commit;

