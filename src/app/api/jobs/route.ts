import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      const missing = [];
      if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: `Server configuration error: missing ${missing.join(', ')}` }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    const organizationId = payload?.organization_id;
    const userEmail = payload?.user_email;

    if (!organizationId) {
      return NextResponse.json({ error: "organization_id is required" }, { status: 400 });
    }

    let userRow = (await supabase
      .from("user")
      .select("id, organization_id, email")
      .eq("id", userId)
      .single()).data;

    if (!userRow) {
      // Auto-create user record if missing
      const { data: newUser, error: insertErr } = await supabase
        .from("user")
        .insert({
          id: userId,
          organization_id: organizationId,
          email: userEmail || null,
        })
        .select()
        .single();
      if (insertErr || !newUser) {
        return NextResponse.json({ error: insertErr?.message || "Failed to create user" }, { status: 500 });
      }
      userRow = newUser;
    }

    if (!userRow || userRow.organization_id !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: job, error: jobErr } = await supabase
      .from("job")
      .insert(payload)
      .select()
      .single();

    if (jobErr) {
      return NextResponse.json({ error: jobErr.message }, { status: 500 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
