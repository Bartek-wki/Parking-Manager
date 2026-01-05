import type { APIRoute } from "astro";
import { listBookings, createBooking } from "../../../lib/services/bookings";
import { listBookingsQuerySchema, createBookingSchema } from "../../../lib/validation/bookings";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const params = {
      location_id: url.searchParams.get("location_id"),
      start_date: url.searchParams.get("start_date"),
      end_date: url.searchParams.get("end_date"),
    };

    const validation = listBookingsQuerySchema.safeParse(params);

    if (!validation.success) {
      return new Response(JSON.stringify({ errors: validation.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase } = locals;
    const { location_id, start_date, end_date } = validation.data;

    const bookings = await listBookings(supabase, {
      locationId: location_id,
      startDate: start_date,
      endDate: end_date,
    });

    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /bookings:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return new Response(JSON.stringify({ errors: validation.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase, user } = locals;

    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bookingId = await createBooking(supabase, validation.data, user.id);

    return new Response(JSON.stringify({ id: bookingId }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /bookings:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message === "Wybrane miejsce jest już zajęte w tym terminie") {
      return new Response(JSON.stringify({ message }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
