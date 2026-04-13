import { NextResponse } from "next/server";
import { switchClubAction } from "@/lib/clubs/actions";

export async function POST(request: Request) {
  try {
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
