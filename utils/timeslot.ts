import type { TimeSlot } from "../types/timeslot";

export const TIME_SLOTS: TimeSlot[] = ["00-06", "06-12", "12-18", "18-24"];

/** Get the time slot for a given ISO timestamp string, adjusted to local timezone. */
export function getTimeSlot(ts: string): TimeSlot {
  const hour = new Date(ts).getHours();
  if (hour < 6) return "00-06";
  if (hour < 12) return "06-12";
  if (hour < 18) return "12-18";
  return "18-24";
}