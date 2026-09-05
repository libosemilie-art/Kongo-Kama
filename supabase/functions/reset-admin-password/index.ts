import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const adminEmail = "kongokama0@gmail.com";
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    const adminFullName = "Mbuta Sita Toma";

    if (!adminPassword) {
      return new Response(JSON.stringify({ error: "ADMIN_PASSWORD secret is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve the admin user by email (no fragile hardcoded UUID)
    let userId: string | null = null;
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (!listError && listData?.users) {
      const found = listData.users.find((u) => u.email === adminEmail);
      userId = found?.id ?? null;
    }

    if (userId) {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminFullName },
      });
    } else {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminFullName },
      });

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = created.user?.id ?? null;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unable to resolve admin user id" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure the profile has the admin role
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: adminEmail,
      full_name: adminFullName,
      role: "admin",
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Admin password reset successfully",
      email: adminEmail,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
