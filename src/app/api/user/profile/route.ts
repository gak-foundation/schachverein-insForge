import { NextResponse } from "next/server";
import { getAuthUserWithClub } from "@/lib/db/queries/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getAuthUserWithClub(user.id);
  return NextResponse.json({ profile });
}
