import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { ExportActivity, ActivityRoute } from "../types";
import ActivitiesMapOverlay from "../components/activities-map-overlay";
import ActivityMap from "../components/activity-map";
import { useEffect, useState } from "react";
import { fetchActivities, fetchActivityGeojson } from "../api";

export const Route = createFileRoute("/map")({
  component: ActivitiesMap,
  loader: async () => await fetchActivities(),
});

function ActivitiesMap() {
  const activities = useLoaderData({ from: "/map" });
  const [activityRoutes, setActivityRoutes] = useState<ActivityRoute[]>([]);

  useEffect(() => {
    (async () => {
      const routes = await getAllActivityRoutes(activities);
      setActivityRoutes(routes);
    })();
  }, [activities]);

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        <ActivityMap activityRoutes={activityRoutes} />
      </div>

      <div className="absolute top-0 left-0 h-auto w-auto mx-8 my-24 bg-white bg-opacity-75 flex flex-col items-center justify-center rounded">
        <ActivitiesMapOverlay activities={activities} />
      </div>
    </>
  );
}

async function getAllActivityRoutes(
  activities: ExportActivity[]
): Promise<ActivityRoute[]> {
  const routes = await Promise.all(
    activities.map(async (activity) => {
      try {
        const activityGeojson = await fetchActivityGeojson(
          activity.activity_id
        );

        if (
          activityGeojson == null ||
          activityGeojson.features == null ||
          activityGeojson.features.length === 0
        ) {
          return null;
        }

        return activityGeojson;
      } catch (error) {
        return null;
      }
    })
  );

  const filteredRoutes = routes.filter((r) => r != null);
  return filteredRoutes;
}
