import type { APIRoute } from "astro";
import { z } from "zod";
import { listSpots, createSpot } from "../../../../lib/services/spots";
import { createSpotSchema, listSpotsQuerySchema } from "../../../../lib/validation/spots";
import { DEFAULT_USER_ID } from "../../../../db/supabase.client";

export const prerender = false;

// Helper to validate UUID
const uuidSchema = z.string().uuid();

/**
 * List spots for a location.
 * Method: GET
 * URL: /api/locations/[location_id]/spots
 * Query Params: active_only (boolean)
 */
export const GET: APIRoute = async ({ params, request, locals }) => {
  const { id: locationId } = params;

  // Validate locationId
  const idValidation = uuidSchema.safeParse(locationId);
  if (!idValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid location ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate query params
  const url = new URL(request.url);
  const activeOnlyParam = url.searchParams.get("active_only");

  const queryValidation = listSpotsQuerySchema.safeParse({
    active_only: activeOnlyParam,
  });

  if (!queryValidation.success) {
    return new Response(JSON.stringify({ errors: queryValidation.error.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // In a real scenario, we would get the user ID from the session
    const userId = DEFAULT_USER_ID;

    const spots = await listSpots(
      locals.supabase,
      locationId!,
      queryValidation.data.active_only,
      userId
    );

    return new Response(JSON.stringify(spots), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching spots:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

/**
 * Create a spot in a location.
 * Method: POST
 * URL: /api/locations/[location_id]/spots
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  const { id: locationId } = params;

  // Validate locationId
  const idValidation = uuidSchema.safeParse(locationId);
  if (!idValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid location ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const parsedBody = createSpotSchema.parse(body);

    // In a real scenario, we would get the user ID from the session
    const userId = DEFAULT_USER_ID;

    const newSpot = await createSpot(locals.supabase, locationId!, parsedBody, userId);

    return new Response(JSON.stringify(newSpot), {
      status: 201,
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
          JSON.stringify({ error: "Spot number already exists in this location" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      // Foreign key violation (Location not found)
      if (error.code === "23503") {
        return new Response(JSON.stringify({ error: "Location not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    console.error("Error creating spot:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
