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
        path: "/activity/:id",
        element: <ActivityDetailPage />,
        loader: activityDetailPageLoader,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
