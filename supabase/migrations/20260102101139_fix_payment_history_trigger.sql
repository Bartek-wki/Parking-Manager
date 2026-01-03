-- Fix payment_history trigger to work in dev environment without authentication
-- Problem: Trigger may not work correctly when RLS is disabled and auth is not used
-- Solution: Use security definer to ensure trigger works regardless of auth context

begin;

-- Drop existing trigger
drop trigger if exists bookings_payment_status_audit on public.bookings;

-- Recreate function with security definer (works regardless of auth context)
-- This is safe because the trigger only inserts records based on booking data
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
        -- For inserts, log the initial status
        v_previous := new.payment_status;
        v_new := new.payment_status;
    elsif tg_op = 'update' then
        -- Only log if payment_status actually changed
        if not (new.payment_status is distinct from old.payment_status) then
            return new;
        end if;
        v_previous := old.payment_status;
        v_new := new.payment_status;
    else
        return new;
    end if;

    -- Insert payment history record
    -- Use new.user_id for changed_by when auth.uid() is NULL (dev environment)
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

-- Recreate trigger
create trigger bookings_payment_status_audit
after insert or update of payment_status on public.bookings
for each row
execute function public.bookings_payment_status_audit();

-- Note: In dev environment with RLS disabled, no additional policy is needed
-- The security definer function will bypass RLS checks

commit;

