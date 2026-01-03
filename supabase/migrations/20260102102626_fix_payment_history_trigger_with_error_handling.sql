-- Fix payment_history trigger with better error handling and diagnostics
-- This migration ensures the trigger works correctly even with RLS enabled/disabled

begin;

-- Drop existing trigger
drop trigger if exists bookings_payment_status_audit on public.bookings;

-- Recreate function with security definer and better error handling
create or replace function public.bookings_payment_status_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_previous public.payment_status;
    v_new public.payment_status;
    v_error_message text;
begin
    -- Handle INSERT case
    if tg_op = 'insert' then
        v_previous := new.payment_status;
        v_new := new.payment_status;
        raise notice 'Trigger fired: INSERT booking_id=%, payment_status=%', new.id, new.payment_status;
    -- Handle UPDATE case
    elsif tg_op = 'update' then
        -- Only log if payment_status actually changed
        if not (new.payment_status is distinct from old.payment_status) then
            raise notice 'Trigger fired: UPDATE booking_id=%, payment_status unchanged (%), skipping', new.id, new.payment_status;
            return new;
        end if;
        v_previous := old.payment_status;
        v_new := new.payment_status;
        raise notice 'Trigger fired: UPDATE booking_id=%, payment_status changed from % to %', new.id, v_previous, v_new;
    else
        return new;
    end if;

    -- Insert payment history record with error handling
    begin
        raise notice 'Inserting payment_history: booking_id=%, user_id=%, previous=%, new=%, changed_by=%', 
            new.id, new.user_id, v_previous, v_new, coalesce(auth.uid(), new.user_id);
        
        insert into public.payment_history (user_id, booking_id, previous_status, new_status, changed_by)
        values (
            new.user_id,
            new.id,
            v_previous,
            v_new,
            coalesce(auth.uid(), new.user_id)
        );
        
        raise notice 'Successfully inserted payment_history for booking_id=%', new.id;
    exception
        when others then
            -- Log error but don't fail the transaction
            v_error_message := SQLERRM;
            raise warning 'Failed to insert payment_history for booking_id=%: %', new.id, v_error_message;
            -- Still return new to allow the booking update to succeed
            return new;
    end;

    return new;
end;
$$;

-- Recreate trigger - make sure it fires on payment_status changes
-- Note: The WHEN clause can only check column values, not tg_op
-- The function itself handles checking if payment_status actually changed
create trigger bookings_payment_status_audit
after insert or update of payment_status on public.bookings
for each row
execute function public.bookings_payment_status_audit();

-- Ensure RLS is handled correctly
-- If RLS is enabled, grant necessary permissions to the function owner
-- Note: With security definer, the function runs as the function owner (usually postgres)
-- so RLS should not block it, but we ensure payment_history is accessible

-- Drop any conflicting policies that might interfere
drop policy if exists payment_history_insert_trigger on public.payment_history;

commit;

