import type { APIRoute } from "astro";
import { z } from "zod";
import { updateClient } from "../../../lib/services/clients";
import { updateClientSchema } from "../../../lib/validation/clients";

export const prerender = false;

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const { id } = params;

    // Validate ID format (UUID)
    const idSchema = z.string().uuid();
    const idValidation = idSchema.safeParse(id);

    if (!idValidation.success) {
      return new Response(JSON.stringify({ error: "Invalid ID format" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const parsedBody = updateClientSchema.parse(body);

    const updatedClient = await updateClient(
      locals.supabase,
      idValidation.data,
      parsedBody,
      userId
    );

    return new Response(JSON.stringify(updatedClient), {
      status: 200,
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

    // Supabase returns a specific error if .single() fails (PGRST116)
    // We can try to catch that to return 404
    if (typeof error === "object" && error !== null && "code" in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }

    console.error("Error updating client:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
