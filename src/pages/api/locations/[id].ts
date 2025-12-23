import type { APIRoute } from "astro";
import { z } from "zod";
import { updateLocation } from "../../../lib/services/locations";
import { updateLocationSchema } from "../../../lib/validation/locations";

export const prerender = false;

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Location ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate ID format (simple check, or use Zod uuid)
  const idSchema = z.string().uuid();
  const idValidation = idSchema.safeParse(id);
  if (!idValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid Location ID format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const parsedBody = updateLocationSchema.parse(body);

    // Ensure we are not sending an empty update
    if (Object.keys(parsedBody).length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedLocation = await updateLocation(locals.supabase, id, parsedBody);

    return new Response(JSON.stringify(updatedLocation), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.errors }), {
        status: 422,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Supabase error for "no rows returned" when using .single()
    if (error?.code === "PGRST116") {
      return new Response(JSON.stringify({ error: "Location not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.error("Error updating location:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
