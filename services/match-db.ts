import type { MatchData } from "../types/match-data";
import { openDb } from "./create-db";

async function storeMatches(matches: MatchData[]): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise((resolve) => {
    const tx = db.transaction("matches", "readwrite");
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);

    const store = tx.objectStore("matches");
    for (const match of matches) {
      store.put(match);
    }

    tx.commit();
  });
}

async function getAllMatches(userid: string): Promise<MatchData[]> {
  const db = await openDb();
  if (!db) return [];

  return new Promise((resolve) => {
    const tx = db.transaction("matches", "readonly");
    const store = tx.objectStore("matches").index("userid");
    const getReq = store.getAll(userid);

    getReq.onsuccess = () => resolve(getReq.result);
    getReq.onerror = () => resolve([]);
  });
}

async function getMatchesBefore(timestamp: string): Promise<MatchData | null> {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction("matches", "readonly");
    const idx = tx.objectStore("matches").index("ts");

    const range = IDBKeyRange.lowerBound(timestamp, false);

    const getReq = idx.get(range);

    getReq.onsuccess = () => resolve(getReq.result ?? null);
    getReq.onerror = () => resolve(null);
  });
}

export {
  storeMatches,
  getAllMatches,
  getMatchesBefore,
}