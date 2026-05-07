import { NextResponse } from "next/server";
import { bindUserToTenant } from "@/lib/auth/tenant-binding";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId, email, name, slug, invitationToken } = await request.json();

    if (!userId || !email || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: userId, email, slug" },
        { status: 400 }
      );
    }

    // SECURITY: Only allow users to bind themselves
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot bind other users" },
        { status: 403 }
      );
    }

    // SECURITY: Verify email matches session
    if (session.user.email !== email) {
      return NextResponse.json(
        { error: "Forbidden: Email mismatch" },
        { status: 403 }
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
