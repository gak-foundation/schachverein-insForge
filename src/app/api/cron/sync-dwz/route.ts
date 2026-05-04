import { createServiceClient } from "@/lib/insforge";
import { fetchDwzData } from "@/lib/dwz";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const client = createServiceClient();
    const { data: allMembersWithId, error } = await client
      .from("members")
      .select("id, dwz_id, dwz, elo")
      .not("dwz_id", "is", null);

    if (error) {
      console.error("Error fetching members:", error);
      throw error;
    }

    let updatedCount = 0;

    for (const m of allMembersWithId || []) {
      if (!m.dwz_id) continue;

      const data = await fetchDwzData(m.dwz_id);

      if (data && data.dwz !== m.dwz) {
        const { error: updateError } = await client
          .from("members")
          .update({ dwz: data.dwz })
          .eq("id", m.id);

        if (updateError) {
          console.error("Error updating member %s:", m.id, updateError);
          continue;
        }

        const { error: insertError } = await client.from("dwz_history").insert([
          {
            member_id: m.id,
            dwz: data.dwz,
            elo: m.elo,
            source: "cron-sync",
            recorded_at: new Date().toISOString().split("T")[0],
          },
        ]);

        if (insertError) {
          console.error("Error inserting dwz history for %s:", m.id, insertError);
        }

        updatedCount++;
      }

      // Gentle rate limiting for the DeWIS simulation/API
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      totalChecked: allMembersWithId?.length ?? 0,
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
