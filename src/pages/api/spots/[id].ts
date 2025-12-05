import type { APIRoute } from "astro";
import { z } from "zod";
import { updateSpot } from "../../../lib/services/spots";
import { updateSpotSchema } from "../../../lib/validation/spots";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

// Helper to validate UUID
const uuidSchema = z.string().uuid();

/**
 * Update a spot by ID.
 * Method: PATCH
 * URL: /api/spots/[id]
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id: spotId } = params;

  // Validate spotId
  const idValidation = uuidSchema.safeParse(spotId);
  if (!idValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid spot ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const parsedBody = updateSpotSchema.parse(body);

    // In a real scenario, we would get the user ID from the session
    const userId = DEFAULT_USER_ID;

    const updatedSpot = await updateSpot(locals.supabase, spotId!, parsedBody, userId);

    return new Response(JSON.stringify(updatedSpot), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle Supabase/Postgres errors
    if (error.code) {
      // Unique violation
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({
            error: "Spot number already exists in this location",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Handle "Row not found" (PGRST116 is returned by .single() when no rows match)
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Spot not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    console.error("Error updating spot:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
