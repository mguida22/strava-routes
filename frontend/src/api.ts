import { Activity } from "./types";

const SERVER_URL = "http://localhost:8080";

// TODO: placeholder until we have a user system setup
const USER_ID = 1;

type ActivityFormat = GeoJSON.FeatureCollection<GeoJSON.Point>;

async function getActivityGeojson(
  activityId: string
): Promise<ActivityFormat | null> {
  const response = await fetch(
    `${SERVER_URL}/${USER_ID}/activities/${activityId}`
  );

  if (!response.ok) {
    console.error(response.status, response.statusText);
    return null;
  }

  return await response.json();
}

async function getActivityDetail(activityId: string): Promise<Activity> {
  const allActivities = await getActivities();
  const activity = allActivities.find((a) => a.activity_id === activityId);

  if (activity == null) {
    throw new Error("Activity not found");
  }

  return activity;
}

async function getActivities(): Promise<Activity[]> {
  try {
    const response = await fetch(`${SERVER_URL}/${USER_ID}/activities`);

    if (!response.ok) {
      console.error(response.status, response.statusText);
      throw new Error("Failed to fetch activities");
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch activities");
  }
}

export { getActivities, getActivityDetail, getActivityGeojson };
