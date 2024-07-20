import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ErrorPage from "./ErrorPage.tsx";
import ActivityDetail, {
  loader as activityDetailLoader,
} from "./ActivityDetail.tsx";
import ActivityList, { loader as activityListLoader } from "./ActivityList.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/activities",
        element: <ActivityList />,
        loader: activityListLoader,
      },
      {
        path: "/activity/:id",
        element: <ActivityDetail />,
        loader: activityDetailLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
