import { Activity } from "../types";
import {
  formatDate,
  formatDistance,
  formatDuration,
} from "../utils/formatters";

interface ActivityDetailOverlayProps {
  activity: Activity;
}

function ActivityDetailOverlay({ activity }: ActivityDetailOverlayProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl text-extrabold mb-4">{activity.name}</h2>
      <p>Date: {formatDate(activity.start_date_local)}</p>
      <p>Distance: {formatDistance(activity.distance)}</p>
      <p>Duration: {formatDuration(activity.moving_time)}</p>
    </div>
  );
}

export default ActivityDetailOverlay;
