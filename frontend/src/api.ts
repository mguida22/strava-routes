import { useUser } from "./user-provider";
import { useQuery } from "@tanstack/react-query";

const SERVER_URL = import.meta.env.VITE_API_HOSTNAME;

async function makeRequest(url: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Error response while fetching ${url}. ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}`, error);
    throw error;
  }
}

function validateUserId(userId: string | null) {
  if (userId == null) {
    throw new Error("User not logged in");
  }
}

export function useActivities() {
  const { user } = useUser();
  const userId = user?.userId ?? null;

  return useQuery({
    queryKey: ["activities", { userId }] as const,
    queryFn: ({ queryKey }) => {
      const [_key, { userId }] = queryKey;
      validateUserId(userId);

      const url = `${SERVER_URL}/${userId}/activities`;
      return makeRequest(url);
    },
    enabled: !!userId,
  });
}

export function useActivity(activityId: string) {
  const { user } = useUser();
  const userId = user?.userId ?? null;

  return useQuery({
    queryKey: ["activity", { userId, activityId }] as const,
    queryFn: ({ queryKey }) => {
      const [_key, { userId, activityId }] = queryKey;
      validateUserId(userId);

      const url = `${SERVER_URL}/${userId}/activities/${activityId}`;
      return makeRequest(url);
    },
    enabled: !!userId,
  });
}

export async function syncActivities(userId: string) {
  return await makeRequest(`${SERVER_URL}/${userId}/sync-activities`);
}
