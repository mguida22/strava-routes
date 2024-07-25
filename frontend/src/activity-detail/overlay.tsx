import { Activity } from "../types";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

function formatDistance(distance: string) {
  const d = parseFloat(distance);
  // strava distances are in km, we want to convert to miles
  const miles = d / 1.609344;
  return `${miles.toFixed(2)} miles`;
}

function formatDuration(duration: string) {
  const d = parseFloat(duration);

  // return a string in the format of "hours:minutes"
  const hours = Math.floor(d / 3600);
  const minutes = Math.floor((d % 3600) / 60);

  if (hours > 0) {
    return `${hours} hours, ${minutes} minutes`;
  }

  return `${minutes} minutes`;
}

interface ActivityDetailOverlayProps {
  activity: Activity;
}

function ActivityDetailOverlay({ activity }: ActivityDetailOverlayProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl text-extrabold mb-4">{activity.activity_name}</h2>
      <p>Date: {formatDate(activity.activity_date)}</p>
      <p>Distance: {formatDistance(activity.distance)}</p>
      <p>Duration: {formatDuration(activity.moving_time)}</p>
    </div>
  );
}

export default ActivityDetailOverlay;
