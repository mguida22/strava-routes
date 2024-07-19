import "dotenv/config";
import axios from "axios";

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;

async function getAccessToken(): Promise<string> {
  const response = await axios.post("https://www.strava.com/oauth/token", {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  return response.data.access_token;
}

async function getActivities(accessToken: string): Promise<any> {
  try {
    const response = await axios.get(
      "https://www.strava.com/api/v3/athlete/activities",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response.data);
    throw error;
  }
}

async function main() {
  const accessToken = await getAccessToken();
  const activities = await getActivities(accessToken);
  console.log(activities);
}

main(); //.catch(console.error);
