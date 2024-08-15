import { DateTime } from "luxon";

export function formatDate(dateString: string) {
  const dt = DateTime.fromISO(dateString);
  return dt.toLocaleString();
}

export function formatDateTime(dateString: string) {
  const dt = DateTime.fromISO(dateString);
  return dt.toLocaleString(DateTime.DATETIME_SHORT);
}

export function formatDistance(d: number) {
  // strava distances are in m, we want to convert to miles
  const miles = d / 1609.344;
  return `${miles.toFixed(2)} miles`;
}

export function formatDuration(d: number) {
  // return a string in the format of "hours:minutes"
  const hours = Math.floor(d / 3600);
  const minutes = Math.floor((d % 3600) / 60);

  if (hours > 0) {
    return `${hours} hours, ${minutes} minutes`;
  }

  return `${minutes} minutes`;
}
