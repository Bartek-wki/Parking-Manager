-- Fix RLS policy and trigger error handling for payment_history
-- This migration fixes the issue where payment_history records were not created
-- due to restrictive RLS policies and swallowed errors in the trigger.

begin;

-- 1. Drop the restrictive policy that blocks inserts when user_id != auth.uid()
-- The previous policy 'payment_history_insert_authenticated' forced user_id = auth.uid().
-- This fails when an admin updates a booking for a client, or when running as anon/service_role.
drop policy if exists payment_history_insert_authenticated on public.payment_history;

-- 2. Update the trigger function to remove exception swallowing
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
    -- Handle INSERT case
    if tg_op = 'insert' then
        v_previous := new.payment_status;
        v_new := new.payment_status;
    -- Handle UPDATE case
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
    -- We use coalesce(auth.uid(), new.user_id) for changed_by
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

-- 3. CRITICAL: Ensure the function is owned by postgres to bypass RLS
-- This ensures that even if called by 'anon' or a limited user, the SECURITY DEFINER
-- executes with superuser privileges, allowing insert into payment_history regardless of policies.
alter function public.bookings_payment_status_audit() owner to postgres;

commit;
