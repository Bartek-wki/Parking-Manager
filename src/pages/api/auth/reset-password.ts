import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies, url }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email jest wymagany" }), { status: 400 });
    }

    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(import.meta.env.SUPABASE_URL, serviceRoleKey);

      // Check user existence using listUsers to avoid rate limits triggered by generateLink
      // Note: effective for MVP/small user base.
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (listError) {
        return new Response(JSON.stringify({ error: "Błąd weryfikacji użytkownika" }), {
          status: 500,
        });
      }

      const userExists = data.users.some(
        (user) => user.email?.toLowerCase() === email.toLowerCase()
      );

      if (!userExists) {
        return new Response(
          JSON.stringify({ error: "Użytkownik o podanym adresie email nie istnieje" }),
          { status: 400 }
        );
      }
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Assuming we have a page to handle the password reset after clicking the link
    // The callback will handle the code exchange and redirect to /reset-password (or similar)
    const callbackUrl = new URL("/api/auth/callback", url.origin).toString();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "Wysłano email z linkiem resetowania hasła" }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Błąd serwera" }), { status: 500 });
  }
};
