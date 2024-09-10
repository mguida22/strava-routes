import { useEffect, useState } from "react";
import { syncActivities, useActivities } from "../api";
import { useUser } from "../user-provider";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const HOSTNAME = import.meta.env.VITE_HOSTNAME;

const REDIRECT_URL = `${HOSTNAME}/strava-auth-redirect`;
const SCOPE = "read,activity:read";

function StravaAuthButton() {
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const activities = useActivities();

  const handleAuthClick = () => {
    const authUrl = `http://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URL}&approval_prompt=force&scope=${SCOPE}`;

    window.location.href = authUrl;
  };

  const handleSyncClick = async () => {
    if (user == null) {
      return;
    }

    setIsSyncing(true);
    await syncActivities(user.userId);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isSyncing) {
        setIsSyncing(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [activities, isSyncing]);

  return (
    <div className="flex">
      {user != null && (
        <button
          type="button"
          className={
            isSyncing
              ? "rounded p-2 bg-gray-300 text-gray-500"
              : "rounded p-2 bg-orange-500 text-white"
          }
          onClick={handleSyncClick}
          disabled={isSyncing}
        >
          {isSyncing ? "Syncing..." : "Sync"}
        </button>
      )}
      <button
        type="button"
        onClick={handleAuthClick}
        className={
          user == null
            ? "rounded p-2 bg-orange-500 text-white"
            : "rounded p-2 bg-gray-300 text-gray-500 ml-2"
        }
        disabled={user != null}
      >
        {user == null ? "Connect Strava" : "Strava Connected"}
      </button>
    </div>
  );
}

export default StravaAuthButton;
