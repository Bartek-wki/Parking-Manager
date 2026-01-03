import type { APIRoute } from "astro";
import { getBookingById, updateBooking, deleteBooking } from "../../../lib/services/bookings";
import { updateBookingSchema, deleteBookingIdSchema } from "../../../lib/validation/bookings";

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
    const booking = await getBookingById(supabase, id);

    if (!booking) {
      return new Response(JSON.stringify({ message: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(booking), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /bookings/[id]:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ message }), {
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
    await updateBooking(supabase, id, result.data);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error in PATCH /bookings/[id]:", error);
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

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ message: "Booking ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const idValidation = deleteBookingIdSchema.safeParse(id);
    if (!idValidation.success) {
      return new Response(JSON.stringify({ message: "Invalid booking ID format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase } = locals;
    await deleteBooking(supabase, id);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error("Error in DELETE /bookings/[id]:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";

    if (message === "Booking not found") {
      return new Response(JSON.stringify({ message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
