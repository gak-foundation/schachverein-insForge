const DB_NAME = "schachverein-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-results";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface PendingResult {
  id?: number;
  gameId: string;
  result: string;
  lichessUrl?: string;
  createdAt: string;
}

export async function savePendingResult(result: Omit<PendingResult, "id">): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    
    const indexRequest = store.getAll();
    indexRequest.onsuccess = () => {
      const existing = (indexRequest.result as PendingResult[]).find(r => r.gameId === result.gameId);
      if (existing && existing.id) {
        const updateRequest = store.put({ ...result, id: existing.id });
        updateRequest.onsuccess = () => resolve(existing.id!);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        const addRequest = store.add(result);
        addRequest.onsuccess = () => resolve(addRequest.result as number);
        addRequest.onerror = () => reject(addRequest.error);
      }
    };
    indexRequest.onerror = () => reject(indexRequest.error);
  });
}

export async function getPendingResults(): Promise<PendingResult[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearPendingResult(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearPendingResultByGameId(gameId: string): Promise<void> {
  const results = await getPendingResults();
  const toDelete = results.find(r => r.gameId === gameId);
  if (toDelete && toDelete.id) {
    await clearPendingResult(toDelete.id);
  }
}

export async function syncPendingResults(): Promise<void> {
  const results = await getPendingResults();
  for (const result of results) {
    try {
      const res = await fetch("/api/games/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: result.gameId,
          result: result.result,
          lichessUrl: result.lichessUrl,
        }),
      });
      if (res.ok && result.id) {
        await clearPendingResult(result.id);
      }
    } catch {
      break;
    }
  }
}
