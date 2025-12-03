import type { APIRoute } from "astro";
import { z } from "zod";
import { getLocationList, createLocation } from "../../../lib/services/locations";
import { createLocationSchema } from "../../../lib/validation/locations";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    const locations = await getLocationList(locals.supabase);
    return new Response(JSON.stringify(locations), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const parsedBody = createLocationSchema.parse(body);

    const newLocation = await createLocation(locals.supabase, parsedBody);

    return new Response(JSON.stringify(newLocation), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: error.errors }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.error("Error creating location:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
