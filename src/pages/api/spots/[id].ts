import type { APIRoute } from "astro";
import { z } from "zod";
import { updateSpot } from "../../../lib/services/spots";
import { updateSpotSchema } from "../../../lib/validation/spots";

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

  if (!spotId) {
    return new Response(JSON.stringify({ error: "Spot ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

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

    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = user.id;

    const updatedSpot = await updateSpot(locals.supabase, spotId, parsedBody, userId);

    return new Response(JSON.stringify(updatedSpot), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.errors }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code?: string }).code
        : undefined;

    // Handle Supabase/Postgres errors
    if (errorCode) {
      // Unique violation
      if (errorCode === "23505") {
        return new Response(
          JSON.stringify({
            errors: [
              {
                path: ["spot_number"],
                message: "Spot number already exists in this location",
                code: "unique",
              },
            ],
          }),
          {
            status: 422,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Handle "Row not found" (PGRST116 is returned by .single() when no rows match)
      if (errorCode === "PGRST116") {
        return new Response(JSON.stringify({ error: "Spot not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // eslint-disable-next-line no-console
    console.error("Error updating spot:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
