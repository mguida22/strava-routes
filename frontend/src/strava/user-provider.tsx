import React, { useCallback } from "react";

interface StravaAuthUser {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  athlete: {};
}

function getStravaAuthFromLocalStorage(): StravaAuthUser | null {
  const accessToken = localStorage.getItem("stravaAccessToken");
  const refreshToken = localStorage.getItem("stravaRefreshToken");
  const expiresAt = localStorage.getItem("stravaExpiresAt");
  const athleteRaw = localStorage.getItem("stravaAthlete");
  const athlete = athleteRaw ? JSON.parse(athleteRaw) : null;

  if (
    accessToken == null ||
    refreshToken == null ||
    expiresAt == null ||
    athlete == null
  ) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt,
    athlete,
  };
}

function setStravaAuthInLocalStorage({
  accessToken,
  refreshToken,
  expiresAt,
  athlete,
}: StravaAuthUser) {
  localStorage.setItem("stravaAccessToken", accessToken);
  localStorage.setItem("stravaRefreshToken", refreshToken);
  localStorage.setItem("stravaExpiresAt", expiresAt);
  localStorage.setItem("stravaAthlete", JSON.stringify(athlete));
}

interface StravaAuthUserContext {
  stravaAuthUser: StravaAuthUser | null;
  setStravaAuthUser: (authUser: StravaAuthUser) => void;
}

const stravaAuthUserContext = React.createContext<StravaAuthUserContext>({
  stravaAuthUser: null,
  setStravaAuthUser: () => {},
});

function initializeAuthUser(): StravaAuthUser | null {
  const stravaAuth = getStravaAuthFromLocalStorage();
  if (!stravaAuth) {
    return null;
  }

  return {
    accessToken: stravaAuth.accessToken,
    refreshToken: stravaAuth.refreshToken,
    expiresAt: stravaAuth.expiresAt,
    athlete: stravaAuth.athlete,
  };
}

export function StravaAuthUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stravaAuthUser, _setStravaAuthUser] =
    React.useState<StravaAuthUser | null>(initializeAuthUser());

  /** Updates the Strava Auth User in state and localStorage so this info
   * persists across page reloads
   */
  const setStravaAuthUser = useCallback(
    (authUser: StravaAuthUser) => {
      setStravaAuthInLocalStorage(authUser);
      _setStravaAuthUser(authUser);
    },
    [_setStravaAuthUser]
  );

  return (
    <stravaAuthUserContext.Provider
      value={{ stravaAuthUser, setStravaAuthUser }}
    >
      {children}
    </stravaAuthUserContext.Provider>
  );
}

export function useStravaAuthUser() {
  return React.useContext(stravaAuthUserContext);
}
