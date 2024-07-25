import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStravaAuthUser } from "./user-provider";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

function StravaRedirectPage() {
  const navigate = useNavigate();
  const { setStravaAuthUser } = useStravaAuthUser();
  const exchangeAttempted = useRef(false);

  const exchangeToken = useCallback(
    async (code: string) => {
      // ensure we only attempt to exchange the token once
      if (exchangeAttempted.current === true) return;
      exchangeAttempted.current = true;

      try {
        const url = `https://www.strava.com/api/v3/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&grant_type=authorization_code`;
        const response = await fetch(url, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to exchange token");
        }

        const data = await response.json();

        setStravaAuthUser({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.expires_at,
          athlete: data.athlete,
        });
      } catch (error) {
        console.error(error);
      } finally {
        navigate("/", { replace: true });
      }
    },
    [navigate, setStravaAuthUser]
  );

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      console.log("no code provided. redirecting to /");
      navigate("/", { replace: true });
      return;
    }

    exchangeToken(code);
  }, [exchangeToken, navigate]);

  return <div>Redirecting...</div>;
}

export default StravaRedirectPage;
