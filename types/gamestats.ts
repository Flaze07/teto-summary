export interface Gamestats {
  winrate: number;
  total: number;
  wins: number;
  loss: number;
  apm: number; //attack per minute
  pps: number; //piece per second 
  vs: number; //vs score
  app: number; //attack per piece
  vsapm: number; //vs score / apm
  dsps: number; //dowstack / second
  dspp: number; //downstack / piece
  cheese: number;
  opener: number;
  plonk: number;
}