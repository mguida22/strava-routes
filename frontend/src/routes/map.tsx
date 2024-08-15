import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import ActivityMap from "../components/activity-map";
import { fetchActivities } from "../api";

export const Route = createFileRoute("/map")({
  component: ActivitiesMap,
  loader: async () => await fetchActivities(),
});

function ActivitiesMap() {
  const activities = useLoaderData({ from: "/map" });

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        <ActivityMap activities={activities} />
      </div>
    </>
  );
}
