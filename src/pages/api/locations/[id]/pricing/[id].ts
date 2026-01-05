import type { APIRoute } from "astro";
import { z } from "zod";
import {
  updatePricingException,
  deletePricingException,
} from "../../../../../lib/services/pricing-exceptions";
import { createPricingExceptionSchema } from "../../../../../lib/validation/pricing-exceptions";

export const prerender = false;

// Helper to validate UUID
const uuidSchema = z.string().uuid();

export const PUT: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const pricingIndex = pathSegments.indexOf("pricing");
  const location_id = pathSegments[pricingIndex - 1];
  const id = pathSegments[pricingIndex + 1];

  if (!location_id || !id) {
    return new Response(JSON.stringify({ error: "Location ID and Exception ID are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const idValidation = uuidSchema.safeParse(id);
  const locationIdValidation = uuidSchema.safeParse(location_id);

  if (!idValidation.success || !locationIdValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid ID format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const parsedBody = createPricingExceptionSchema.parse(body);

    await updatePricingException(locals.supabase, id, {
      ...parsedBody,
      user_id: userId,
    });

    return new Response(JSON.stringify({ message: "Exception updated successfully" }), {
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

    if (error.code) {
      // Conflict
      if (error.code === "23505") {
        return new Response(
          JSON.stringify({ error: "Conflict: Pricing exception for this period already exists" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      // Row not found or permission denied (RLS) - UPDATE returns empty data if not matched
      // But updatePricingException uses .single() which throws specific error if no rows returned?
      // Supabase .single() returns { data: null, error: { code: 'PGRST116', details: 'The result contains 0 rows' } } if no rows.
      if (error.code === "PGRST116") {
        return new Response(
          JSON.stringify({ error: "Pricing exception not found or access denied" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    console.error("Error updating pricing exception:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");
  const pricingIndex = pathSegments.indexOf("pricing");
  const location_id = pathSegments[pricingIndex - 1];
  const id = pathSegments[pricingIndex + 1];

  if (!location_id || !id) {
    return new Response(JSON.stringify({ error: "Location ID and Exception ID are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const idValidation = uuidSchema.safeParse(id);
  const locationIdValidation = uuidSchema.safeParse(location_id);

  if (!idValidation.success || !locationIdValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid ID format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await deletePricingException(locals.supabase, id);

    return new Response(null, {
      status: 204,
    });
  } catch (error: any) {
    console.error("Error deleting pricing exception:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
