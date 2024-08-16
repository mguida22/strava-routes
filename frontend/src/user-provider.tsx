import React, { useCallback } from "react";

export interface UserInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

function getUserFromLocalStorage(): UserInfo | null {
  try {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("stravaAccessToken");
    const refreshToken = localStorage.getItem("stravaRefreshToken");
    const expiresAtRaw = localStorage.getItem("stravaExpiresAt");
    const expiresAt = expiresAtRaw ? parseInt(expiresAtRaw) : null;

    if (
      userId == null ||
      accessToken == null ||
      refreshToken == null ||
      expiresAt == null
    ) {
      throw new Error("Missing required fields in localStorage");
    }

    return {
      userId,
      accessToken,
      refreshToken,
      expiresAt,
    };
  } catch (error) {
    // There's always a chance localStorage data is malformed or missing.
    // In this case, we'll just clear localStorage, return null and let the
    // app re-authenticate.
    localStorage.removeItem("userId");
    localStorage.removeItem("stravaAccessToken");
    localStorage.removeItem("stravaRefreshToken");
    localStorage.removeItem("stravaExpiresAt");

    return null;
  }
}

export function setUserInLocalStorage({
  userId,
  accessToken,
  refreshToken,
  expiresAt,
}: UserInfo) {
  localStorage.setItem("userId", userId);
  localStorage.setItem("stravaAccessToken", accessToken);
  localStorage.setItem("stravaRefreshToken", refreshToken);
  localStorage.setItem("stravaExpiresAt", expiresAt.toString());
}

interface UserContext {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
}

const userContext = React.createContext<UserContext>({
  user: null,
  setUser: () => {},
});

function initializeUser(): UserInfo | null {
  const userAuth = getUserFromLocalStorage();
  if (!userAuth) {
    return null;
  }

  return {
    userId: userAuth.userId,
    accessToken: userAuth.accessToken,
    refreshToken: userAuth.refreshToken,
    expiresAt: userAuth.expiresAt,
  };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, _setUser] = React.useState<UserInfo | null>(initializeUser());

  /** Updates the User in state and localStorage so this info
   * persists across page reloads
   */
  const setUser = useCallback(
    (user: UserInfo) => {
      setUserInLocalStorage(user);
      _setUser(user);
    },
    [_setUser]
  );

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
}

export function useUser() {
  return React.useContext(userContext);
}
