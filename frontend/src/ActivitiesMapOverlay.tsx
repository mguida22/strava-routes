import { Activity } from "./types";

interface ActivitiesMapOverlayProps {
  activities: Activity[];
}

function ActivitiesMapOverlay({ activities }: ActivitiesMapOverlayProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl text-extrabold mb-4">Your Activities</h2>
      <div className="max-h-[400px] overflow-y-auto">
        <ul>
          {activities.map((activity) => (
            <li key={activity.activity_id}>{activity.activity_name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ActivitiesMapOverlay;
