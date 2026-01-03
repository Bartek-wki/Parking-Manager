import type { SupabaseClient } from "../../db/supabase.client";
import type {
  BookingCalendarDTO,
  BookingDetailDTO,
  CreateBookingCmd,
  PreviewBookingCmd,
  PreviewBookingResponse,
  UpdateBookingCmd,
} from "../../types";

export async function listBookings(
  supabase: SupabaseClient,
  params: { locationId: string; startDate: string; endDate: string }
): Promise<BookingCalendarDTO[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id, spot_id, client_id, start_date, end_date, status, payment_status, type,
      client:clients!bookings_client_id_fkey(first_name, last_name),
      spot:spots!bookings_spot_id_fkey(spot_number)
    `
    )
    .eq("location_id", params.locationId)
    .lte("start_date", params.endDate)
    .or(`end_date.is.null,end_date.gte.${params.startDate}`);

  if (error) {
    throw error;
  }

  return (data as unknown as BookingCalendarDTO[]) || [];
}

export async function calculatePreview(
  supabase: SupabaseClient,
  cmd: PreviewBookingCmd
): Promise<PreviewBookingResponse> {
  // 1. Check Availability
  let conflictQuery = supabase
    .from("bookings")
    .select("id")
    .eq("spot_id", cmd.spot_id)
    .eq("status", "aktywna")
    .lte("start_date", cmd.end_date || "9999-12-31") // If end_date is null (permanent), check strictly future
    .or(`end_date.is.null,end_date.gte.${cmd.start_date}`);

  if (cmd.exclude_booking_id) {
    conflictQuery = conflictQuery.neq("id", cmd.exclude_booking_id);
  }

  const { data: conflicts, error: conflictError } = await conflictQuery;

  if (conflictError) throw conflictError;

  if (conflicts && conflicts.length > 0) {
    return {
      available: false,
      total_cost: 0,
      calculation_details: [],
    };
  }

  // 2. Calculate Cost
  // Fetch Location Rates
  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select("daily_rate, monthly_rate")
    .eq("id", cmd.location_id)
    .single();

  if (locationError) throw locationError;
  if (!location) throw new Error("Location not found");

  // For permanent bookings, use monthly rate directly
  if (cmd.type === "permanent") {
    return {
      available: true,
      total_cost: location.monthly_rate,
      calculation_details: [],
    };
  }

  // For periodic bookings, calculate cost based on daily rates
  // Fetch Pricing Exceptions
  const exceptionQuery = supabase
    .from("price_exceptions")
    .select("*")
    .eq("location_id", cmd.location_id)
    .lte("start_date", cmd.end_date || "9999-12-31")
    .gte("end_date", cmd.start_date);

  const { data: exceptions, error: exceptionError } = await exceptionQuery;

  if (exceptionError) throw exceptionError;

  const start = new Date(cmd.start_date);
  // Default to 1 day if not specified.
  // For permanent bookings without end_date, we calculate cost for 1 day as a base preview.
  const calcEnd = cmd.end_date ? new Date(cmd.end_date) : new Date(cmd.start_date);

  const days: { date: string; rate: number; exception: string | null }[] = [];
  let totalCost = 0;

  const current = new Date(start);
  while (current <= calcEnd) {
    const dateStr = current.toISOString().split("T")[0];

    // Find applicable exception
    const exception = exceptions?.find((e) => e.start_date <= dateStr && e.end_date >= dateStr);

    const baseRate = location.daily_rate;
    // Note: Using daily_rate as base. Monthly logic would require handling full month durations separately.

    let finalRate = baseRate;
    let exceptionName = null;

    if (exception) {
      finalRate = baseRate * (1 + exception.percentage_change / 100);
      exceptionName = exception.description;
    }

    totalCost += finalRate;
    days.push({
      date: dateStr,
      rate: finalRate,
      exception: exceptionName,
    });

    current.setDate(current.getDate() + 1);
  }

  return {
    available: true,
    total_cost: Math.round(totalCost * 100) / 100, // Round to 2 decimals
    calculation_details: days,
  };
}

export async function createBooking(
  supabase: SupabaseClient,
  cmd: CreateBookingCmd,
  userId: string
): Promise<string> {
  // 1. Check Availability (Reuse logic or let DB constraint handle it, but plan says "check in code")
  // Reuse calculatePreview logic or similar check
  const preview = await calculatePreview(supabase, {
    ...cmd,
    end_date: cmd.end_date || undefined, // handle null vs undefined
  });

  if (!preview.available) {
    throw new Error("Wybrane miejsce jest już zajęte w tym terminie");
  }

  // 2. Create Booking
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: userId,
      client_id: cmd.client_id,
      spot_id: cmd.spot_id,
      location_id: cmd.location_id,
      start_date: cmd.start_date,
      end_date: cmd.end_date,
      type: cmd.type,
      status: "aktywna", // Default status
      payment_status: "nieoplacone", // Default status
      cost: cmd.type === "periodic" ? preview.total_cost : null,
    })
    .select("id")
    .single();

  if (error) throw error;

  return data.id;
}

export async function getBookingById(
  supabase: SupabaseClient,
  id: string
): Promise<BookingDetailDTO> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      client:clients!bookings_client_id_fkey(*),
      spot:spots!bookings_spot_id_fkey(*),
      location:locations!bookings_location_id_fkey(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  // Transform data to match BookingDetailDTO if needed (Supabase returns nested objects correctly with above syntax)
  return data as BookingDetailDTO;
}

export async function updateBooking(
  supabase: SupabaseClient,
  id: string,
  cmd: UpdateBookingCmd
): Promise<void> {
  const updates: Partial<UpdateBookingCmd> & { cost?: number | null } = { ...cmd };

  // If start_date or end_date changes, validate dates and recalculate cost
  if (cmd.start_date || cmd.end_date) {
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("start_date, end_date, location_id, spot_id, type")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Determine effective dates (new value or existing value)
    const effectiveStart = cmd.start_date || booking.start_date;
    const effectiveEnd = cmd.end_date !== undefined ? cmd.end_date : booking.end_date; // Handle null/undefined carefully if needed, but end_date is string | null in DB

    // Basic date validation
    if (effectiveEnd && new Date(effectiveEnd) < new Date(effectiveStart)) {
      throw new Error("End date cannot be before start date");
    }

    // Check availability for NEW dates (always check collision if dates change)
    // We use calculatePreview for availability check even if we don't need cost for permanent
    const preview = await calculatePreview(supabase, {
      location_id: booking.location_id,
      spot_id: booking.spot_id,
      start_date: effectiveStart,
      end_date: effectiveEnd,
      type: booking.type, // Use existing type
      exclude_booking_id: id,
    });

    if (!preview.available) {
      throw new Error("Wybrane miejsce jest już zajęte w tym terminie");
    }

    updates.cost = preview.total_cost;
  }

  const { error } = await supabase.from("bookings").update(updates).eq("id", id);

  if (error) throw error;
}

export async function listPaymentHistoryByBookingId(supabase: SupabaseClient, bookingId: string) {
  const { data, error } = await supabase
    .from("payment_history")
    .select("*")
    .eq("booking_id", bookingId)
    .order("changed_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function deleteBooking(supabase: SupabaseClient, id: string): Promise<void> {
  // First check if booking exists
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      throw new Error("Booking not found");
    }
    throw fetchError;
  }

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Delete the booking (payment_history will be deleted automatically via CASCADE)
  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) throw error;
}
