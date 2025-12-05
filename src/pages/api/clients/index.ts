import type { APIRoute } from "astro";
import { z } from "zod";
import { listClients, createClient } from "../../../lib/services/clients";
import { createClientSchema } from "../../../lib/validation/clients";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Plan: Get user from locals
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();

    // For current development state (matching locations.ts), we fallback to DEFAULT_USER_ID
    const userId = user?.id || DEFAULT_USER_ID;

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
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();
    const userId = user?.id || DEFAULT_USER_ID; // Fallback for dev

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
