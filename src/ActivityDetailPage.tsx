import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import ActivityMap from "./Map";
import { getActivityDetail, getActivityGeojson } from "./api";
import { Activity } from "./types";
import ActivityDetailOverlay from "./ActivityDetailOverlay";

interface ActivityDetailPageLoader {
  activity: Activity;
  activityGeojson: GeoJSON.FeatureCollection<GeoJSON.Point> | null;
}

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<ActivityDetailPageLoader> {
  if (params.id == null) throw new Error("Activity ID is required");

  const activity = getActivityDetail(params.id);
  const activityGeojson = await getActivityGeojson(params.id);

  return { activity, activityGeojson };
}

function ActivityDetailPage() {
  const { activity, activityGeojson } =
    useLoaderData() as ActivityDetailPageLoader;

  return (
    <>
      <div className="w-full h-[calc(100vh-64px)] relative">
        {activityGeojson != null ? (
          <ActivityMap activityGeojson={activityGeojson} />
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

export default ActivityDetailPage;
