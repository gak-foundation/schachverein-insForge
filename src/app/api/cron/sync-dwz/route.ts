import { db } from "@/lib/db";
import { members, dwzHistory } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { fetchDwzData } from "@/lib/dwz";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const allMembersWithId = await db
      .select({
        id: members.id,
        dwzId: members.dwzId,
        dwz: members.dwz,
        elo: members.elo,
      })
      .from(members)
      .where(sql`${members.dwzId} IS NOT NULL`);

    let updatedCount = 0;

    for (const m of allMembersWithId) {
      if (!m.dwzId) continue;
      
      const data = await fetchDwzData(m.dwzId);
      
      if (data && data.dwz !== m.dwz) {
        await db
          .update(members)
          .set({ dwz: data.dwz })
          .where(eq(members.id, m.id));

        await db.insert(dwzHistory).values({
          memberId: m.id,
          dwz: data.dwz,
          elo: m.elo,
          source: "cron-sync",
          recordedAt: new Date().toISOString().split("T")[0],
        });
        
        updatedCount++;
      }
      
      // Gentle rate limiting for the DeWIS simulation/API
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      totalChecked: allMembersWithId.length,
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
