import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { ExportActivity, ActivityPath } from "../types";
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
  const [activityPaths, setActivityPaths] = useState<ActivityPath[]>([]);

  useEffect(() => {
    (async () => {
      const paths = await getAllActivityPaths(activities);
      setActivityPaths(paths);
    })();
  }, [activities]);

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        <ActivityMap activityPaths={activityPaths} />
      </div>

      <div className="absolute top-0 left-0 h-auto w-auto mx-8 my-24 bg-white bg-opacity-75 flex flex-col items-center justify-center rounded">
        <ActivitiesMapOverlay activities={activities} />
      </div>
    </>
  );
}

async function getAllActivityPaths(
  activities: ExportActivity[]
): Promise<ActivityPath[]> {
  const paths = await Promise.all(
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

  const filteredPaths = paths.filter((p) => p != null);
  return filteredPaths;
}
