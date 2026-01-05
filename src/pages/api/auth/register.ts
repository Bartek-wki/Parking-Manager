import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { registerBackendSchema } from "../../../lib/validation/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const validationResult = registerBackendSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      // Combine errors into a single string or return the first one
      const errorMessage = Object.values(errors).flat().join(", ");
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
      });
    }

    const { email, password } = validationResult.data;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    // If session is returned (auto-confirm enabled), the cookies are set by supabase client automatically
    // via the cookie methods we passed to createServerClient.

    return new Response(JSON.stringify({ user: data.user, session: data.session }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
