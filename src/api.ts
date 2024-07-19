import activityJson from "../public/activity.json";
import activitiesJson from "../public/activities.json";
import { Activity } from "./types";

type ActivityFormat = GeoJSON.FeatureCollection<GeoJSON.Point>;

const activityGeojson = activityJson as unknown as ActivityFormat;

function getActivityGeojson(): ActivityFormat {
  return activityGeojson;
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
