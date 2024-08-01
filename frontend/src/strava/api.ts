import { ApiActivity } from "../types";
import {
  useStravaAuth,
  setStravaAuthInLocalStorage,
  StravaAuthInfo,
} from "./user-provider";

const API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME;
const STRAVA_BASE_URL = "https://www.strava.com/api/v3";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestConfig {
  method: RequestMethod;
  path: string;
  data?: any;
  headers?: Record<string, string>;
}

class StravaApiWrapper {
  private accessToken: string | null;
  private refreshToken: string | null;

  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  setAuthInfo(auth: StravaAuthInfo) {
    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    const { method, path, data, headers = {} } = config;

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const response = await fetch(`${STRAVA_BASE_URL}${path}`, options);

      if (response.status === 401) {
        // Auth error, try to refresh token
        const authInfo = await this.refreshAuthInfo();
        if (authInfo) {
          this.setAuthInfo(authInfo);
          return this.request<T>(config);
        }
      }

      if (!response.ok) {
        throw new Error(
          `StravaApiWrapper HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  private async refreshAuthInfo(): Promise<StravaAuthInfo | null> {
    if (!this.refreshToken) {
      console.error("No refresh token found");
      return null;
    }

    const url = `${API_HOSTNAME}/strava/token-refresh?refresh_token=${this.refreshToken}`;

    try {
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();

      setStravaAuthInLocalStorage({
        userId: data.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      });

      return {
        userId: data.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      };
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }

  /** Fetch the first 30 activities for the logged in user */
  async getAthleteActivities(): Promise<ApiActivity[]> {
    return this.request({ method: "GET", path: "/athlete/activities" });
  }
}

export function useStravaApi(): StravaApiWrapper {
  const { stravaAuth } = useStravaAuth();
  const api = new StravaApiWrapper();

  if (stravaAuth) {
    api.setAuthInfo(stravaAuth);
  }

  return api;
}
