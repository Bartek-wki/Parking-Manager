import type { APIRoute } from "astro";
import { createBookingSchema, listBookingsQuerySchema } from "../../../lib/validation/bookings";
import { createBooking, listBookings } from "../../../lib/services/bookings";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const queryParams = {
      location_id: url.searchParams.get("location_id"),
      start_date: url.searchParams.get("start_date"),
      end_date: url.searchParams.get("end_date"),
    };

    const result = listBookingsQuerySchema.safeParse(queryParams);

    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase } = locals;
    // Map camelCase params for service
    const bookings = await listBookings(supabase, {
      locationId: result.data.location_id,
      startDate: result.data.start_date,
      endDate: result.data.end_date,
    });

    return new Response(JSON.stringify(bookings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in GET /bookings:", error);
    return new Response(JSON.stringify({ message: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase } = locals;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || DEFAULT_USER_ID; // Fallback for dev

    try {
      const newBookingId = await createBooking(supabase, result.data, userId);
      return new Response(JSON.stringify({ id: newBookingId }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      if (err.message === "Wybrane miejsce jest już zajęte w tym terminie") {
        return new Response(JSON.stringify({ message: err.message }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Error in POST /bookings:", error);
    return new Response(JSON.stringify({ message: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
