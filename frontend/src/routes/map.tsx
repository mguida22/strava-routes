import { createFileRoute } from "@tanstack/react-router";
import ActivityMap from "../components/activity-map";
import { useActivities } from "../api";

export const Route = createFileRoute("/map")({
  component: ActivitiesMap,
});

function ActivitiesMap() {
  const activities = useActivities();

  if (activities.isPending) {
    return <div>Loading...</div>;
  }

  if (activities.isError) {
    return <div>Error loading activities: {activities.error.message}</div>;
  }

  if (!activities.data) {
    return <div>No activities found</div>;
  }

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        <ActivityMap activities={activities.data} />
      </div>
    </>
  );
}
