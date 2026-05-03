import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/insforge";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = createServiceClient();
    const { error } = await client
      .from("clubs")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Healthcheck] Error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
