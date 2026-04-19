import { Queue, Worker } from "bullmq";
import { getRedisConnection } from "@/lib/auth/redis";
import { db } from "@/lib/db";
import { members, games } from "@/lib/db/schema";
import { fetchLichessGames } from "@/lib/lichess";
import { eq, sql, and } from "drizzle-orm";

const QUEUE_NAME = "lichess-sync";

interface LichessSyncJobData {
  memberId: string;
  lichessUsername: string;
}

let lichessQueue: Queue<LichessSyncJobData> | null = null;

export function getLichessSyncQueue(): Queue<LichessSyncJobData> | null {
  if (lichessQueue) return lichessQueue;

  const connection = getRedisConnection();
  if (!connection) return null;

  lichessQueue = new Queue<LichessSyncJobData>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: 500,
    },
  });

  return lichessQueue;
}

export function startLichessSyncWorker(): Worker<LichessSyncJobData> | null {
  const connection = getRedisConnection();
  if (!connection) return null;

  const worker = new Worker<LichessSyncJobData>(
    QUEUE_NAME,
    async (job) => {
      const { memberId, lichessUsername } = job.data;
      
      const lichessGames = await fetchLichessGames(lichessUsername, 10);
      
      for (const lg of lichessGames) {
        // Check if game already exists
        const [existing] = await db
          .select({ id: games.id })
          .from(games)
          .where(eq(games.lichessUrl, `https://lichess.org/${lg.id}`));

        if (existing) continue;

        // Try to find the opponent in our database
        const opponentLichessUsername = lg.players.white.user?.id === lichessUsername 
          ? lg.players.black.user?.id 
          : lg.players.white.user?.id;

        let opponentId: string | null = null;
        if (opponentLichessUsername) {
          const [opponent] = await db
            .select({ id: members.id })
            .from(members)
            .where(eq(members.lichessUsername, opponentLichessUsername));
          if (opponent) opponentId = opponent.id;
        }

        const isWhite = lg.players.white.user?.id === lichessUsername;
        const whiteId = isWhite ? memberId : opponentId;
        const blackId = isWhite ? opponentId : memberId;

        // Only import if we have both players or at least identified one and it's a club game context
        // For simplicity, we import if we have at least one club member
        if (whiteId || blackId) {
          await db.insert(games).values({
            whiteId,
            blackId,
            result: lg.winner === "white" ? "1-0" : lg.winner === "black" ? "0-1" : "1/2-1/2",
            lichessUrl: `https://lichess.org/${lg.id}`,
            playedAt: new Date(lg.createdAt),
            ecoCode: lg.opening?.eco || null,
          });
        }
      }
    },
    { connection, concurrency: 1 }
  );

  return worker;
}

export async function scheduleLichessSyncForAll() {
  const queue = getLichessSyncQueue();
  if (!queue) return;

  const allMembers = await db
    .select({ id: members.id, lichessUsername: members.lichessUsername })
    .from(members)
    .where(sql`${members.lichessUsername} IS NOT NULL`);

  for (const m of allMembers) {
    if (m.lichessUsername) {
      await queue.add(`lichess-${m.id}`, {
        memberId: m.id,
        lichessUsername: m.lichessUsername,
      });
    }
  }

  return allMembers.length;
}
