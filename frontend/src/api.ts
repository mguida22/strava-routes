import { ExportActivity, ActivityPath } from "./types";

const SERVER_URL = import.meta.env.VITE_API_HOSTNAME;

// TODO: placeholder until we have a user system setup
const USER_ID = 1;

async function fetchActivityGeojson(
  activityId: string,
): Promise<ActivityPath | null> {
  const response = await fetch(
    `${SERVER_URL}/${USER_ID}/activities/${activityId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Couldn't fetch geojson for activity_id:${activityId}. Received status ${response.status}, ${response.statusText}`,
    );
  }

  return await response.json();
}

async function fetchActivityDetail(
  activityId: string,
): Promise<ExportActivity> {
  const allActivities = await fetchActivities();
  const activity = allActivities.find((a) => a.activity_id === activityId);

  if (activity == null) {
    throw new Error("Activity not found");
  }

  return activity;
}

async function fetchActivities(): Promise<ExportActivity[]> {
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

export { fetchActivities, fetchActivityDetail, fetchActivityGeojson };
