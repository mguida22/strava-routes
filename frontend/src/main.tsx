import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./app";
import ErrorPage from "./error-page";
import ActivityDetailPage, {
  loader as activityDetailPageLoader,
} from "./activity-detail/index";
import ActivityListPage, {
  loader as activityListPageLoader,
} from "./activity-list/index";
import ActivitiesMapPage, {
  loader as activitiesMapPageLoader,
} from "./activities-map/index";
import StravaRedirectPage from "./strava/redirect-page";
import { StravaAuthUserProvider } from "./strava/user-provider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <ActivityListPage />,
        loader: activityListPageLoader,
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
    <StravaAuthUserProvider>
      <RouterProvider router={router} />
    </StravaAuthUserProvider>
  </React.StrictMode>
);
