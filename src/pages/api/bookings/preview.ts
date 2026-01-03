import type { APIRoute } from "astro";
import { previewBookingSchema } from "../../../lib/validation/bookings";
import { calculatePreview } from "../../../lib/services/bookings";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const result = previewBookingSchema.safeParse(body);

    if (!result.success) {
      return new Response(JSON.stringify({ errors: result.error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { supabase } = locals;
    const previewData = await calculatePreview(supabase, result.data);

    if (!previewData.available) {
      return new Response(
        JSON.stringify({ message: "Wybrane miejsce jest już zajęte w tym terminie" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(previewData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in bookings/preview:", error);
    return new Response(JSON.stringify({ message: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
