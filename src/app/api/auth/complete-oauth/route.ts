import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/insforge";
import { setAuthCookies } from "@/lib/insforge/server-auth";
import { ensureAuthUser } from "@/lib/db/queries/auth";
import { bindUserToTenant } from "@/lib/auth/tenant-binding";

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken, userId, email, name, avatarUrl, emailVerified, action, slug } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json({ error: "accessToken is required" }, { status: 400 });
    }

    const client = createServerClient(accessToken);

    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (data.user.id !== userId) {
      return NextResponse.json({ error: "User mismatch" }, { status: 403 });
    }

    if (refreshToken) {
      await setAuthCookies(accessToken, refreshToken);
    }

    await ensureAuthUser({
      id: userId,
      email,
      name,
      avatarUrl,
      emailVerified: emailVerified ?? false,
    });

    if (action === "signup" && slug) {
      await bindUserToTenant({
        userId,
        email: email || "",
        name: name || email?.split("@")[0] || "Unknown",
        slug,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("complete-oauth error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
