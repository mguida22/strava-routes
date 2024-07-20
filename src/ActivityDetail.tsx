import { LoaderFunctionArgs, useLoaderData } from "react-router-dom";
import ActivityMap from "./Map";
import { getActivityGeojson } from "./api";

interface ActivityDetailLoader {
  activityGeojson: GeoJSON.FeatureCollection<GeoJSON.Point> | null;
}

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<ActivityDetailLoader> {
  if (params.id == null) return { activityGeojson: null };

  const activityGeojson = await getActivityGeojson(params.id);

  return { activityGeojson };
}

function ActivityDetail() {
  const { activityGeojson } = useLoaderData() as ActivityDetailLoader;

  return (
    <div className="w-full h-full">
      {activityGeojson != null ? (
        <div className="w-full h-[calc(100vh-64px)]">
          <ActivityMap activityGeojson={activityGeojson} />
        </div>
      ) : (
        <h2>Activity not found</h2>
      )}
    </div>
  );
}

export default ActivityDetail;
