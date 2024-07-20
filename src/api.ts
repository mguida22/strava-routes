import activitiesJson from "../public/activities.json";
import { Activity } from "./types";

type ActivityFormat = GeoJSON.FeatureCollection<GeoJSON.Point>;

async function getActivityGeojson(activityId: string): Promise<ActivityFormat> {
  return await import(`../public/activities/${activityId}.json`);
}

function getActivities(): Activity[] {
  return activitiesJson.map((activity) => {
    return {
      ...activity,
      activity_date_ms: new Date(activity.activity_date).getTime(),
    };
  });
}

export { getActivityGeojson, getActivities };
