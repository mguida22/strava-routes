import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import ActivityMap from "../components/activity-map";
import { fetchAllActivityRoutes } from "../api";

export const Route = createFileRoute("/map")({
  component: ActivitiesMap,
  loader: async () => await fetchAllActivityRoutes(),
});

function ActivitiesMap() {
  const activityRoutes = useLoaderData({ from: "/map" });

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        <ActivityMap activityRoutes={activityRoutes} />
      </div>
    </>
  );
}
