import { useStravaAuth } from "../user-provider";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const HOSTNAME = import.meta.env.VITE_HOSTNAME;

const REDIRECT_URL = `${HOSTNAME}/strava-auth-redirect`;
const SCOPE = "read,activity:read";

function StravaAuthButton() {
  const { stravaAuth } = useStravaAuth();

  const handleAuthClick = () => {
    const authUrl = `http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URL}&approval_prompt=force&scope=${SCOPE}`;

    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      onClick={handleAuthClick}
      className="rounded p-2 bg-orange-500 text-white"
      disabled={stravaAuth != null}
    >
      {stravaAuth == null ? "Connect Strava" : "Strava Connected"}
    </button>
  );
}

export default StravaAuthButton;
