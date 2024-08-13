import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { fetchActivityDetail, fetchActivityGeojson } from "../api";
import ActivityMap from "../components/activity-map";
import ActivityDetailOverlay from "../components/activity-detail-overlay";

export const Route = createFileRoute("/activity/$id")({
  component: ActivityDetail,
  loader: async ({ params: { id } }) => {
    const activity = await fetchActivityDetail(id);
    const activityRoute = await fetchActivityGeojson(id);

    return { activity, activityRoute };
  },
});

function ActivityDetail() {
  const { activity, activityRoute } = useLoaderData({ from: "/activity/$id" });
  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        {activityRoute != null ? (
          <ActivityMap activityRoutes={[activityRoute]} />
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
