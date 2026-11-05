export interface User {
  id: string;
  username: string;
  avatar_revision: number | null;
  banner_revision: number | null;
  country: string | null;
  supporter: boolean;
}

export interface UserRecordResult {
  leaderboard: {
    id: string;
    username: string;
    active: boolean;
    wins: number;
    stats: {
      apm: number;
      pps: number;
      vsscore: number;
      garbagesent: number;
      garbagereceived: number;
      kills: number;
      altitude: number;
      rank: number;
      targetingfactor: number;
      targetingrace: number;
      btb: number
      revives: number;
    }
  }[]
}

export interface UserRecordEntries {
  _id: string;
  replayid: string;
  stub: boolean;
  gamemode: string;
  pb: boolean;
  oncepb: boolean;
  ts: string;
  revolution: string;
  user: User;
  otherusers: User[];
  disputed: boolean;
  results: UserRecordResult;
  p: {
    pri: number;
    sec: number;
    ter: number;
  };
  extras: {
    result: "victory" | "defeat" | "nocontest" | "dqvictory" | "dqdefeat";
  };
}

export interface UserRecord {
  success: true;
  error: any;
  cache: {};
  data: {
    entries: UserRecordEntries[];
  };
}