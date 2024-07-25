import { useLoaderData } from "react-router-dom";
import { getActivities, getActivityGeojson } from "../api";
import { ExportActivity, ActivityPath } from "../types";
import ActivitiesMapOverlay from "./overlay";
import ActivityMap from "../map";
import { useEffect, useState } from "react";

interface ActivitiesMapPageLoader {
  activities: ExportActivity[];
}

export async function loader(): Promise<ActivitiesMapPageLoader> {
  return { activities: await getActivities() };
}

async function getAllActivityPaths(
  activities: ExportActivity[]
): Promise<ActivityPath[]> {
  const paths = await Promise.all(
    activities.map(async (activity) => {
      try {
        const activityGeojson = await getActivityGeojson(activity.activity_id);

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

// TODO: this falls apart with so many activities.
// We need to cut down the number of points for each activity. It's probably
// worth looking into loading this data in a format other than GeoJSON as well.
// https://docs.mapbox.com/help/troubleshooting/working-with-large-geojson-data/
function ActivitiesMapPage() {
  const { activities } = useLoaderData() as ActivitiesMapPageLoader;
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

export default ActivitiesMapPage;
