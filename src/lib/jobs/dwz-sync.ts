import { Queue, Worker } from "bullmq";
import { getRedisConnection } from "@/lib/auth/redis";
import { db } from "@/lib/db";
import { members, dwzHistory } from "@/lib/db/schema";
import { fetchDwzData } from "@/lib/dwz";
import { eq, sql } from "drizzle-orm";

const QUEUE_NAME = "dwz-sync";

interface DwzSyncJobData {
  memberId: string;
  dwzId: string;
}

let dwzQueue: Queue<DwzSyncJobData> | null = null;

export function getDwzSyncQueue(): Queue<DwzSyncJobData> | null {
  if (dwzQueue) return dwzQueue;

  const connection = getRedisConnection();
  if (!connection) return null;

  dwzQueue = new Queue<DwzSyncJobData>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: 1000,
    },
  });

  return dwzQueue;
}

export function startDwzSyncWorker(): Worker<DwzSyncJobData> | null {
  const connection = getRedisConnection();
  if (!connection) return null;

  const worker = new Worker<DwzSyncJobData>(
    QUEUE_NAME,
    async (job) => {
      const { memberId, dwzId } = job.data;
      
      const data = await fetchDwzData(dwzId);
      
      if (data) {
        const [member] = await db
          .select({ dwz: members.dwz, elo: members.elo })
          .from(members)
          .where(eq(members.id, memberId));

        if (member && data.dwz !== member.dwz) {
          await db
            .update(members)
            .set({ dwz: data.dwz })
            .where(eq(members.id, memberId));

          await db.insert(dwzHistory).values({
            memberId,
            dwz: data.dwz,
            elo: member.elo,
            source: "bullmq-sync",
            recordedAt: new Date().toISOString().split("T")[0],
          });
        }
      }
    },
    { connection, concurrency: 2 }
  );

  worker.on("failed", (job, err) => {
    console.error(`[DwzSyncWorker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export async function scheduleAllMembersSync() {
  const queue = getDwzSyncQueue();
  if (!queue) return;

  const allMembers = await db
    .select({ id: members.id, dwzId: members.dwzId })
    .from(members)
    .where(sql`${members.dwzId} IS NOT NULL`);

  for (const m of allMembers) {
    if (m.dwzId) {
      await queue.add(`sync-${m.id}`, {
        memberId: m.id,
        dwzId: m.dwzId,
      });
    }
  }

  return allMembers.length;
}
