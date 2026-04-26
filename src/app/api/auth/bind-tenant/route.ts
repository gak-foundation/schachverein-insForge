import { NextResponse } from "next/server";
import { bindUserToTenant } from "@/lib/auth/tenant-binding";

export async function POST(request: Request) {
  try {
    const { userId, email, name, slug, invitationToken } = await request.json();

    if (!userId || !email || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email, slug" },
        { status: 400 }
      );
    }

    const result = await bindUserToTenant({ userId, email, name, slug, invitationToken });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Tenant binding failed" },
      { status: 500 }
    );
  }
}
