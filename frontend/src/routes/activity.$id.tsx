import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { fetchActivityDetail } from "../api";
import ActivityMap from "../components/activity-map";
import ActivityDetailOverlay from "../components/activity-detail-overlay";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
  loader: async ({ params: { id } }) => {
    const activity = await fetchActivityDetail(id);

    return { activity };
  },
});

function ActivityDetail() {
  const { activity } = useLoaderData({ from: "/activity/$id" });

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        {activity.polyline != "" ? (
          <ActivityMap activities={[activity]} />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <h2 className="text-lg">No map data</h2>
          </div>
        )}
      </div>

      <div className="absolute top-0 left-0 h-auto w-auto mx-8 my-24 bg-white bg-opacity-75 flex flex-col items-center justify-center rounded">
        <ActivityDetailOverlay activity={activity} />
      </div>
    </>
  );
}
