import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import { fetchHistory } from "../../services/fetch-history";
import type { TimeSlot } from "../../types/timeslot";
import { TIME_SLOTS, getTimeSlot } from "../../utils/timeslot";
import { fetchUserInfo } from "../../services/fetch-user-info";
import { Icon } from "@iconify/react";
import type { Gamestats } from "../../types/gamestats";
import { useFetchHistory } from "../../hooks/use-fetch-history";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const STAT_ROWS: { label: string; key: keyof Gamestats; format: (v: number) => string }[] = [
  { label: "WR",     key: "winrate", format: v => `${(v * 100).toFixed(1)}%` },
  { label: "Total",  key: "total",   format: v => `${v}` },
  { label: "Wins",   key: "wins",    format: v => `${v}` },
  { label: "Loss",   key: "loss",    format: v => `${v}` },
  { label: "APM",    key: "apm",     format: v => v.toFixed(2) },
  { label: "PPS",    key: "pps",     format: v => v.toFixed(2) },
  { label: "VS",     key: "vs",      format: v => v.toFixed(2) },
  { label: "APP",    key: "app",     format: v => v.toFixed(3) },
  { label: "VS/APM", key: "vsapm",   format: v => v.toFixed(3) },
  { label: "DS/S",   key: "dsps",    format: v => v.toFixed(3) },
  { label: "DS/P",   key: "dspp",    format: v => v.toFixed(3) },
  { label: "Cheese", key: "cheese",  format: v => v.toFixed(1) },
  { label: "Opener", key: "opener",  format: v => v.toFixed(1) },
  { label: "Plonk",  key: "plonk",   format: v => v.toFixed(1) },
];

const SLOT_LABELS: Record<TimeSlot, string> = {
  "00-06": "00:00 – 05:59",
  "06-12": "06:00 – 11:59",
  "12-18": "12:00 – 17:59",
  "18-24": "18:00 – 23:59",
};

export default function Home() {

  const {
    fetchHistory,
    fetchProgress
  } = useFetchHistory();

  const [queryInput, setQueryInput] = useState<string>("");

  const [gamestats, setGamestats] = useState<Map<TimeSlot, Gamestats>>(new Map());

  const fetchMatchHistory = async (query: string) => {
    const userInfo = await fetchUserInfo(query);
    if (userInfo === null) {
      alert("INVALID USER");
      return;
    }
    const matches = await fetchHistory(userInfo._id);

    const slotBuckets = new Map<TimeSlot, Gamestats>();

    for (const slot of TIME_SLOTS) {
      slotBuckets.set(slot, {
        winrate: 0,
        total: 0,
        wins: 0,
        loss: 0,
        apm: 0,
        pps: 0,
        vs: 0,
        app: 0,
        vsapm: 0,
        dsps: 0,
        dspp: 0,
        cheese: 0,
        opener: 0,
        plonk: 0
      });
    }

    for (const match of matches) {
      const slot = getTimeSlot(match.ts);
      const bucket = slotBuckets.get(slot)!;
      if (match.victory) {
        bucket.wins++;
      } else {
        bucket.loss++;
      }
      bucket.total++;
      bucket.apm += match.apm;
      bucket.pps += match.pps;
      bucket.vs += match.vsscore;
    }
    
    for (const slot of TIME_SLOTS) {
      const bucket = slotBuckets.get(slot)!;
      bucket.winrate = bucket.wins / bucket.total;
      bucket.apm /= bucket.total;
      bucket.pps /= bucket.total;
      bucket.vs /= bucket.total;
      bucket.vsapm = bucket.vs / bucket.apm;
      bucket.app = bucket.apm / (bucket.pps * 60);
      bucket.dsps = (bucket.vs / 100) - (bucket.apm / 60);
      bucket.dspp = ((bucket.vs / 100) - (bucket.apm / 60)) / bucket.pps;
      bucket.cheese = (bucket.dspp * 150) + ((bucket.vsapm - 2) * 50) + (0.6 - bucket.app) * 125;
    }

    const allBucket: Gamestats = { winrate: 0, total: 0, wins: 0, loss: 0, apm: 0, pps: 0, vs: 0, app: 0, vsapm: 0, dsps: 0, dspp: 0, cheese: 0, opener: 0, plonk: 0 };
    for (const slot of TIME_SLOTS) {
      const b = slotBuckets.get(slot)!;
      allBucket.total += b.total;
      allBucket.wins  += b.wins;
      allBucket.loss  += b.loss;
      allBucket.apm   += b.apm * b.total;
      allBucket.pps   += b.pps * b.total;
      allBucket.vs    += b.vs  * b.total;
    }
    if (allBucket.total > 0) {
      allBucket.winrate = allBucket.wins / allBucket.total;
      allBucket.apm /= allBucket.total;
      allBucket.pps /= allBucket.total;
      allBucket.vs  /= allBucket.total;
      allBucket.vsapm = allBucket.vs / allBucket.apm;
      allBucket.app   = allBucket.apm / (allBucket.pps * 60);
      allBucket.dsps  = (allBucket.vs / 100) - (allBucket.apm / 60);
      allBucket.dspp  = allBucket.dsps / allBucket.pps;
      allBucket.cheese = (allBucket.dspp * 150) + ((allBucket.vsapm - 2) * 50) + (0.6 - allBucket.app) * 125;
    }
    slotBuckets.set("all" as TimeSlot, allBucket);

    setGamestats(slotBuckets);
  }

  return (
    <div className="w-screen h-screen bg-[#94C4F0] flex flex-col items-center pt-8">

      {fetchProgress > -1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#89B8E4] rounded-xl px-10 py-8 shadow-hard flex flex-col items-center gap-3">
            <Icon icon="akar-icons:loading" className="animate-spin text-3xl" />
            <p className="text-white font-semibold text-lg">Fetching match history…</p>
            <p className="text-white/80 text-sm">{fetchProgress} matches fetched so far</p>
          </div>
        </div>
      )}
      <div className="rounded-md bg-[#89B8E4] flex flex-row px-4 py-2 gap-4 shadow-hard">
        <input 
          value={queryInput}
          onChange={e => setQueryInput(e.target.value)}
          className="bg-[#EAEAEA] w-10/12 pl-2"
        />
        <button
          onClick={() => fetchMatchHistory(queryInput)}
          className="bg-[#CDF1C8] px-4 rounded-lg cursor-pointer transition-all hover:bg-[#b8e8b2] active:scale-95 active:brightness-90"
        >
          <Icon icon="akar-icons:search" />
        </button>
      </div>

      <table className="mt-4 border-collapse bg-[#A2D2FF] shadow-hard rounded-md overflow-hidden">
        <thead>
          <tr>
            <th className="px-6 py-2 border border-[#89B8E4]"></th>
            {TIME_SLOTS.map(slot => (
              <th key={slot} className="px-6 py-2 border border-[#89B8E4]">
                {SLOT_LABELS[slot]}
              </th>
            ))}
            <th className="px-6 py-2 border border-[#89B8E4] font-bold">All</th>
          </tr>
        </thead>
        <tbody>
          {STAT_ROWS.map(({ label, key, format }) => (
            <tr key={key}>
              <td className="px-6 py-2 border border-[#89B8E4] font-semibold">{label}</td>
              {TIME_SLOTS.map(slot => {
                const stats = gamestats.get(slot);
                return (
                  <td key={slot} className="px-6 py-2 border border-[#89B8E4] text-center">
                    {stats && stats.total > 0 ? format(stats[key]) : "—"}
                  </td>
                );
              })}
              {(() => {
                const all = gamestats.get("all" as TimeSlot);
                return (
                  <td className="px-6 py-2 border border-[#89B8E4] text-center font-bold">
                    {all && all.total > 0 ? format(all[key]) : "—"}
                  </td>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
