import React, { useCallback } from "react";

export interface StravaAuthInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

function getStravaAuthFromLocalStorage(): StravaAuthInfo | null {
  try {
    const accessToken = localStorage.getItem("stravaAccessToken");
    const refreshToken = localStorage.getItem("stravaRefreshToken");
    const expiresAtRaw = localStorage.getItem("stravaExpiresAt");
    const expiresAt = expiresAtRaw ? parseInt(expiresAtRaw) : null;

    if (accessToken == null || refreshToken == null || expiresAt == null) {
      throw new Error("Missing required fields in localStorage");
    }

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  } catch (error) {
    // There's always a chance localStorage data is malformed or missing.
    // In this case, we'll just clear localStorage, return null and let the
    // app re-authenticate.
    localStorage.removeItem("stravaAccessToken");
    localStorage.removeItem("stravaRefreshToken");
    localStorage.removeItem("stravaExpiresAt");

    return null;
  }
}

export function setStravaAuthInLocalStorage({
  accessToken,
  refreshToken,
  expiresAt,
}: StravaAuthInfo) {
  localStorage.setItem("stravaAccessToken", accessToken);
  localStorage.setItem("stravaRefreshToken", refreshToken);
  localStorage.setItem("stravaExpiresAt", expiresAt.toString());
}

interface StravaAuthContext {
  stravaAuth: StravaAuthInfo | null;
  setStravaAuth: (authUser: StravaAuthInfo) => void;
}

const stravaAuthContext = React.createContext<StravaAuthContext>({
  stravaAuth: null,
  setStravaAuth: () => {},
});

function initializeStravaAuth(): StravaAuthInfo | null {
  const stravaAuth = getStravaAuthFromLocalStorage();
  if (!stravaAuth) {
    return null;
  }

  return {
    accessToken: stravaAuth.accessToken,
    refreshToken: stravaAuth.refreshToken,
    expiresAt: stravaAuth.expiresAt,
  };
}

export function StravaAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [stravaAuth, _setStravaAuth] = React.useState<StravaAuthInfo | null>(
    initializeStravaAuth()
  );

  /** Updates the Strava Auth User in state and localStorage so this info
   * persists across page reloads
   */
  const setStravaAuth = useCallback(
    (authUser: StravaAuthInfo) => {
      setStravaAuthInLocalStorage(authUser);
      _setStravaAuth(authUser);
    },
    [_setStravaAuth]
  );

  return (
    <stravaAuthContext.Provider value={{ stravaAuth, setStravaAuth }}>
      {children}
    </stravaAuthContext.Provider>
  );
}

export function useStravaAuth() {
  return React.useContext(stravaAuthContext);
}
