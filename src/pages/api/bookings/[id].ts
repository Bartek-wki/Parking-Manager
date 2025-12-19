import type { APIRoute } from "astro";
import { updateBookingSchema } from "../../../lib/validation/bookings";
import { getBookingById, updateBooking } from "../../../lib/services/bookings";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ message: "Booking ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase } = locals;

    try {
      const booking = await getBookingById(supabase, id);
      if (!booking) {
        // Should catch error usually, but just in case
        return new Response(JSON.stringify({ message: "Booking not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(booking), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      // Supabase returns a specific error if .single() fails on 0 rows
      if (err.code === "PGRST116") {
        return new Response(JSON.stringify({ message: "Booking not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw err;
    }
  } catch (error: any) {
    console.error("Error in GET /bookings/[id]:", error);
    return new Response(JSON.stringify({ message: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Booking ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const result = updateBookingSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase } = locals;

    try {
      await updateBooking(supabase, id, result.data);
    } catch (err: any) {
      if (err.message === "End date cannot be before start date") {
        return new Response(JSON.stringify({ message: err.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (err.message === "Spot is already booked for this period") {
        return new Response(JSON.stringify({ message: err.message }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw err;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in PATCH /bookings/[id]:", error);
    return new Response(JSON.stringify({ message: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
