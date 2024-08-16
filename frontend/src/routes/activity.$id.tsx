import { createFileRoute, useParams } from "@tanstack/react-router";
import ActivityMap from "../components/activity-map";
import ActivityDetailOverlay from "../components/activity-detail-overlay";
import { useActivity } from "../api";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = useParams({ from: "/activity/$id" });
  const activity = useActivity(id);

  if (activity.isPending) {
    return <div>Loading...</div>;
  }

  if (activity.isError) {
    return <div>Error loading activity: {activity.error.message}</div>;
  }

  if (!activity.data) {
    return <div>No activity found</div>;
  }

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        {activity.data.polyline != "" ? (
          <ActivityMap activities={[activity.data]} />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <h2 className="text-lg">No map data</h2>
          </div>
        )}
      </div>

      <div className="absolute top-0 left-0 h-auto w-auto mx-8 my-24 bg-white bg-opacity-75 flex flex-col items-center justify-center rounded">
        <ActivityDetailOverlay activity={activity.data} />
      </div>
    </>
  );
}
