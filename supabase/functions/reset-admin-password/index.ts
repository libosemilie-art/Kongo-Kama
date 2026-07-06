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

    const adminEmail = "mbutasita@kongokama.com";
    const adminPassword = "KongoKama###";
    const adminFullName = "Mbuta Sita Toma";
    const adminId = "f858eb72-b295-4981-8611-6113e5701047";

    // Update the existing admin user's password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminId,
      {
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: adminFullName },
      }
    );

    if (updateError) {
      // If user doesn't exist, create them
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
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

      // Ensure profile has admin role
      await supabaseAdmin.from("profiles").upsert({
        id: createData.user?.id,
        email: adminEmail,
        full_name: adminFullName,
        role: "admin",
      });
    } else {
      // Ensure profile has admin role
      await supabaseAdmin.from("profiles").upsert({
        id: adminId,
        email: adminEmail,
        full_name: adminFullName,
        role: "admin",
      });
    }

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
