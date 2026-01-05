import type { APIRoute } from "astro";
import { z } from "zod";
import {
  getPricingExceptionsByLocationId,
  createPricingException,
} from "../../../../../lib/services/pricing-exceptions";
import { createPricingExceptionSchema } from "../../../../../lib/validation/pricing-exceptions";

export const prerender = false;

// Helper to validate UUID
const uuidSchema = z.string().uuid();

export const GET: APIRoute = async ({ params, locals }) => {
  const { id: location_id } = params;

  const idValidation = uuidSchema.safeParse(location_id);
  if (!idValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid location ID" }), {
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

    const exceptions = await getPricingExceptionsByLocationId(
      locals.supabase,
      location_id!,
      userId
    );

    return new Response(JSON.stringify(exceptions), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching pricing exceptions:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { id: location_id } = params;

  const idValidation = uuidSchema.safeParse(location_id);
  if (!idValidation.success) {
    return new Response(JSON.stringify({ error: "Invalid location ID" }), {
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

    const newException = await createPricingException(locals.supabase, {
      ...parsedBody,
      location_id: location_id!,
      user_id: userId,
    });

    return new Response(JSON.stringify(newException), {
      status: 201,
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

    // Handle Postgres errors
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
      // Foreign Key Violation
      if (error.code === "23503") {
        return new Response(JSON.stringify({ error: "Location not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    console.error("Error creating pricing exception:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
