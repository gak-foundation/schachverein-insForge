import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { setFeatureFlag, ALL_FLAGS } from "@/lib/feature-flags";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId, flag, enabled } = await request.json();
  await setFeatureFlag(clubId, flag as any, enabled);
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json(ALL_FLAGS);
}
