import { NextResponse } from "next/server";
import { getAuthUserWithClub } from "@/lib/db/queries/auth";
import { createServerAuthClient } from "@/lib/insforge/server-auth";

export async function GET() {
  try {
  const client = await createServerAuthClient();
  const { data, error } = await client.auth.getCurrentUser();

    if (error || !data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getAuthUserWithClub(data.user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
