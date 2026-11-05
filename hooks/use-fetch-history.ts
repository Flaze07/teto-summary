import { useState } from "react";
import { getAllMatches, storeMatches } from "../services/match-db";
import type { MatchData } from "../types/match-data";
import type { UserRecord } from "../types/user-record";
import { sleep } from "../utils/sleep";

export const useFetchHistory = () => {
  
  const [fetchProgress, setFetchProgress] = useState<number>(-1);

  const fetchHistory = async (id: string): Promise<MatchData[]> => {
    setFetchProgress(0);
    let pri = 0;
    let sec = 0;
    let ter = 0;

    const matches = await getAllMatches(id);

    const newMatches: Map<string, MatchData> = new Map();

    while (true) {
      const url = new URL("/.netlify/functions/fetch-history", window.location.origin);
      url.searchParams.set("id", id);
      url.searchParams.set("pri", String(pri));
      url.searchParams.set("sec", String(sec));
      url.searchParams.set("ter", String(ter));

      const resp = await fetch(url.toString());

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error ?? "Failed to fetch match history");
      }

      const data = (await resp.json()) as UserRecord;
      const entries = data.data.entries;

      entries.forEach(entry => {
        if (newMatches.has(entry._id) || (
          entry.extras.result !== "victory" &&
          entry.extras.result !== "defeat" &&
          entry.extras.result !== "dqvictory" &&
          entry.extras.result !== "dqdefeat"
        )) {
          return;
        }

        newMatches.set(entry._id, {
          id: entry._id,
          ...entry.results.leaderboard[0].stats,
          userid: id,
          opponent: entry.otherusers[0].username,
          victory: entry.extras.result === "victory" || entry.extras.result === "dqvictory",
          ts: entry.ts,
        })
      })

      
      if (entries.length < 100) {
        break;
      }

      const latest = entries[entries.length - 1];

      if (matches.find(match => match.id === latest._id) !== undefined) {
        break;
      }

      const last = entries[entries.length - 1];
      pri = last.p.pri;
      sec = last.p.sec;
      ter = last.p.ter;

      setFetchProgress(prev => prev + 100);
      await sleep(2000);
    }

    const localIds = new Set(matches.map(m => m.id));
    for (const key of newMatches.keys()) {
      if (localIds.has(key)) {
        newMatches.delete(key);
      }
    }
    
    const newMatchesArr = Array.from(newMatches.values());

    await storeMatches(newMatchesArr);

    newMatchesArr.forEach(m => {
      matches.push(m);
    })

    setFetchProgress(-1);
    return matches;
  } 
  return { 
    fetchHistory, 
    fetchProgress 
  };
}