import { Activity } from "./types";

const SERVER_URL = import.meta.env.VITE_API_HOSTNAME;

// TODO: placeholder until we have a user system setup
const USER_ID = "66ab058b157551037dcf0401";

async function fetchActivityDetail(activityId: string): Promise<Activity> {
  const url = `${SERVER_URL}/${USER_ID}/activities/${activityId}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(response.status, response.statusText);
      throw new Error(`Error response while fetching ${url}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to fetch ${url}`);
  }
}

async function fetchActivities(): Promise<Activity[]> {
  const url = `${SERVER_URL}/${USER_ID}/activities`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(response.status, response.statusText);
      throw new Error(`Error response while fetching ${url}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to fetch ${url}`);
  }
}

export { fetchActivities, fetchActivityDetail };
