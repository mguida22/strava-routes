import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useCallback, useRef } from "react";
import { useStravaAuth } from "../strava/user-provider";

export const Route = createLazyFileRoute("/strava-auth-redirect")({
  component: StravaRedirect,
});

const API_HOSTNAME = import.meta.env.VITE_API_HOSTNAME;

function StravaRedirect() {
  const navigate = useNavigate();
  const { setStravaAuth } = useStravaAuth();
  const exchangeAttempted = useRef(false);

  const exchangeToken = useCallback(
    async (code: string) => {
      // ensure we only attempt to exchange the token once
      if (exchangeAttempted.current === true) return;
      exchangeAttempted.current = true;

      try {
        const url = `${API_HOSTNAME}/strava/token-exchange?code=${code}`;
        const response = await fetch(url, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to exchange token");
        }

        const data = await response.json();

        setStravaAuth({
          userId: data.id,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.expires_at,
        });
      } catch (error) {
        console.error(error);
      } finally {
        navigate({ to: "/", replace: true });
      }
    },
    [navigate, setStravaAuth]
  );

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      console.log("no code provided. redirecting to /");
      navigate({ to: "/", replace: true });
      return;
    }

    exchangeToken(code);
  }, [exchangeToken, navigate]);

  return <div>Redirecting...</div>;
}
