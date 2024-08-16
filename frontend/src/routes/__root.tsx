import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "../index.css";

import StravaAuthButton from "../components/auth-button";

export const Route = createRootRoute({
  component: () => (
    <div>
      <header className="fixed top-0 start-0 z-50 w-full border-b p-4 flex justify-between align-center border-gray-200 bg-gray-50">
        <Link to="/">
          <h1 className="text-3xl font-bold ">Strava Routes</h1>
        </Link>
        <StravaAuthButton />
      </header>
      <main className="flex items-center mx-auto pt-16">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
