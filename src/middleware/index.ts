import { createSupabaseServerInstance } from "../db/supabase.client";
import { defineMiddleware } from "astro:middleware";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages & Static Assets
const PUBLIC_PATHS = [
  // Auth Pages
  "/login",
  "/register",
  "/forgot-password",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",

  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout", // Logout should be accessible but logic handles session
  "/api/auth/callback",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(
  async ({ locals, cookies, url, request, redirect }, next) => {
    // Skip auth check for public paths and static assets
    // Also skip for internal Supabase calls if any, but we control the client
    const isPublic = PUBLIC_PATHS.some(
      (path) => url.pathname === path || url.pathname.startsWith(path + "/")
    );
    // Simple check for assets/static files if needed, though usually handled by Astro before middleware for static files in public

    // We create the client for every request to ensure we can access it if needed (even on public pages for "if logged in" checks)
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Set supabase instance on locals (legacy support or if used elsewhere)
    // Casting to any to avoid type mismatch with the generic client if needed,
    // but better to align types in env.d.ts which I did.
    locals.supabase = supabase as any;

    // Always get user session first before any other operations
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      locals.user = {
        email: user.email,
        id: user.id,
      };
    }

    // Protection Logic
    if (!isPublic && !user) {
      // If accessing API without auth, return 401
      if (url.pathname.startsWith("/api/")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }
      // Redirect to login for protected pages
      return redirect("/login");
    }

    // If user is logged in and tries to access login/register, redirect to dashboard (/)
    if (
      user &&
      (url.pathname === "/login" ||
        url.pathname === "/register" ||
        url.pathname === "/forgot-password")
    ) {
      return redirect("/");
    }

    return next();
  }
);
