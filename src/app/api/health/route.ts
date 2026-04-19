import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRedis } from "@/lib/auth/redis";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Datenbank Check
    await db.execute(sql`SELECT 1`);

    // 2. Redis Check (falls konfiguriert)
    const redis = getRedis();
    let redisStatus = "not_configured";
    
    if (redis) {
      await redis.ping();
      redisStatus = "connected";
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error("[Healthcheck] Error:", error);
    return NextResponse.json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
