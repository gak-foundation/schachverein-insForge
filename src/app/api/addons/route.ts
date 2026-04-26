import { NextResponse } from "next/server";
import { getClubPlan } from "@/lib/billing/queries";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }

  try {
    const plan = await getClubPlan(clubId);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Failed to fetch plan:", error);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}
