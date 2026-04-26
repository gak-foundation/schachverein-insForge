import { NextResponse } from "next/server";
import { getClubBySlug } from "@/lib/clubs/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Slug required" }, { status: 400 });
  }

  const club = await getClubBySlug(slug);

  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  if (!club.isActive) {
    return NextResponse.json({ error: "Club inactive" }, { status: 403 });
  }

  return NextResponse.json({
    id: club.id,
    name: club.name,
    slug: club.slug,
  });
}
