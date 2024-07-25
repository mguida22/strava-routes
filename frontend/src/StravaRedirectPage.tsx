import { useEffect } from "react";
import { useAuthUser } from "./user-provider";
import { useNavigate } from "react-router-dom";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

function StravaRedirectPage() {
  const navigate = useNavigate();
  const { setAuthUser } = useAuthUser();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      console.log("no code provided. redirecting to /");
      window.location.href = "/";
    }

    // TODO: is this running twice?
    const exchangeToken = async () => {
      try {
        const url = `https://www.strava.com/api/v3/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code`;
        const response = await fetch(url, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to exchange token");
        }

        const data = await response.json();
        localStorage.setItem("stravaAccessToken", data.access_token);
        localStorage.setItem("stravaRefreshToken", data.refresh_token);
        localStorage.setItem("stravaExpiresAt", data.expires_at);

        setAuthUser({
          stravaAccessToken: data.access_token,
          stravaRefreshToken: data.refresh_token,
          stravaExpiresAt: data.expires_at,
          athlete: data.athlete,
        });
      } catch (error) {
        console.error(error);
      } finally {
        navigate("/", { replace: true });
      }
    };

    exchangeToken();
  }, []);

  return <div>Redirecting...</div>;
}

export default StravaRedirectPage;
