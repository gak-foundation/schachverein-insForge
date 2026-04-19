// import "@/env"; // Trigger Env Validation
import { startEmailWorker } from "@/lib/auth/email";
import { startDwzSyncWorker } from "@/lib/jobs/dwz-sync";
import { startLichessSyncWorker } from "@/lib/jobs/lichess-sync";

console.log("🚀 Starting Background Workers...");

const emailWorker = startEmailWorker();
const dwzWorker = startDwzSyncWorker();
const lichessWorker = startLichessSyncWorker();

if (!emailWorker || !dwzWorker || !lichessWorker) {
  console.warn("⚠️ One or more workers failed to start (likely due to missing Redis connection).");
} else {
  console.log("✅ All workers initialized successfully.");
}

// Graceful Shutdown handling
function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}, shutting down workers gracefully...`);
  
  Promise.all([
    emailWorker?.close(),
    dwzWorker?.close(),
    lichessWorker?.close()
  ]).then(() => {
    console.log("👋 Workers stopped. Exiting.");
    process.exit(0);
  }).catch((err) => {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
