import type { APIRoute } from "astro";
import { z } from "zod";
import { listClients, createClient } from "../../../lib/services/clients";
import { createClientSchema } from "../../../lib/validation/clients";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = user.id;

    const search = url.searchParams.get("search");
    const clients = await listClients(locals.supabase, userId, search);

    return new Response(JSON.stringify(clients), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
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
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const parsedBody = createClientSchema.parse(body);

    const newClient = await createClient(locals.supabase, userId, parsedBody);

    return new Response(JSON.stringify(newClient), {
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

    console.error("Error creating client:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
