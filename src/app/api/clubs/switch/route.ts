import { NextResponse } from "next/server";
import { switchClubAction } from "@/lib/clubs/actions";
import { createServerClient } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.auth.getCurrentUser();

    if (error || !data?.user) {
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const { clubId } = await request.json();

    if (!clubId) {
      return NextResponse.json(
        { error: "Club ID ist erforderlich" },
        { status: 400 }
      );
    }

    await switchClubAction(clubId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Club switch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler beim Wechseln des Vereins" },
      { status: 500 }
    );
  }
}
