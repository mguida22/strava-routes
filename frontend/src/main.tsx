import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ErrorPage from "./ErrorPage.tsx";
import ActivityDetailPage, {
  loader as activityDetailPageLoader,
} from "./ActivityDetailPage.tsx";
import ActivityList, { loader as activityListLoader } from "./ActivityList.tsx";
import ActivitiesMapPage, {
  loader as activitiesMapPageLoader,
} from "./ActivitiesMapPage.tsx";
import StravaRedirectPage from "./StravaRedirectPage.tsx";
import { AuthUserProvider } from "./user-provider.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <ActivityList />,
        loader: activityListLoader,
      },
      {
        path: "/map",
        element: <ActivitiesMapPage />,
        loader: activitiesMapPageLoader,
      },
      {
        path: "/activity/:id",
        element: <ActivityDetailPage />,
        loader: activityDetailPageLoader,
      },
      {
        path: "/strava-auth-redirect",
        element: <StravaRedirectPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthUserProvider>
      <RouterProvider router={router} />
    </AuthUserProvider>
  </React.StrictMode>
);
