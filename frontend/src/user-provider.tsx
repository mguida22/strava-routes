import React from "react";

interface AuthUser {
  stravaAccessToken: string;
  stravaRefreshToken: string;
  stravaExpiresAt: string;
  athlete: {};
}

interface AuthUserContext {
  authUser: AuthUser | null;
  setAuthUser: (authUser: AuthUser) => void;
}

const authUserContext = React.createContext<AuthUserContext>({
  authUser: null,
  setAuthUser: () => {},
});

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);

  return (
    <authUserContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </authUserContext.Provider>
  );
}

export function useAuthUser() {
  return React.useContext(authUserContext);
}
