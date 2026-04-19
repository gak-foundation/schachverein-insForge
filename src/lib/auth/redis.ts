import Redis from "ioredis";

let redisInstance: Redis | null = null;

export function getRedis(): Redis | null {
  // Edge runtime check
  if (typeof process !== "undefined" && process.env && (process.env as any).NEXT_RUNTIME === "edge") {
    return null; // ioredis not supported in Edge
  }

  if (redisInstance) return redisInstance;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[Redis] REDIS_URL not set — rate limiting and BullMQ jobs unavailable");
    return null;
  }

  try {
    redisInstance = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("[Redis] Giving up after 3 retries");
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisInstance.on("error", (err) => {
      console.error("[Redis] Connection error:", err.message);
      redisInstance = null;
    });

    redisInstance.on("close", () => {
      redisInstance = null;
    });

    return redisInstance;
  } catch (err) {
    console.warn("[Redis] Failed to initialize:", err);
    return null;
  }
}

export function getRedisConnection(): { host: string; port: number } | undefined {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return undefined;

  try {
    const url = new URL(redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 6379,
    };
  } catch {
    return undefined;
  }
}