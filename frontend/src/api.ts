import { decode as decodePolyline } from "@googlemaps/polyline-codec";
import { ExportActivity, ActivityRoute } from "./types";

const SERVER_URL = import.meta.env.VITE_API_HOSTNAME;

// TODO: placeholder until we have a user system setup
const USER_ID = "66ab058b157551037dcf0401";

async function fetchActivityGeojson(
  activityId: string,
): Promise<ActivityRoute | null> {
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

interface ApiActivityRoute {
  polyline: string;
  id: string;
}

function polylineToGeojson(route: ApiActivityRoute): ActivityRoute {
  // decode into LatLng, then reverse order for Mapbox
  const coordinates = decodePolyline(route.polyline).map(([lat, lng]) => [
    lng,
    lat,
  ]);

  const geojson = {
    type: "FeatureCollection",
    properties: {},
    features: [
      {
        type: "Feature",
        properties: {
          id: route.id,
        },
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    ],
  } as ActivityRoute;

  return geojson;
}

async function fetchAllActivityRoutes(): Promise<ActivityRoute[]> {
  try {
    const response = await fetch(`${SERVER_URL}/${USER_ID}/activities/routes`);

    if (!response.ok) {
      console.error(response.status, response.statusText);
      throw new Error("Error response while fetching activities/routes");
    }

    const routes: ApiActivityRoute[] = await response.json();

    return routes.map(polylineToGeojson);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch activities/routes");
  }
}

export {
  fetchActivities,
  fetchActivityDetail,
  fetchActivityGeojson,
  fetchAllActivityRoutes,
};
