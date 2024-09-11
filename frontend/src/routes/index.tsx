import { createFileRoute } from "@tanstack/react-router";
import { useActivities } from "../api";
import { useUser } from "../user-provider";
import { ActivitiesTable } from "../components/activities-table";
import { ActivitiesCharts } from "../components/activities-charts";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useUser();
  const activities = useActivities();

  if (user == null) {
    return (
      <EmptyActivityTable>
        <p>Connect strava to view your activities</p>
      </EmptyActivityTable>
    );
  }

  if (activities.isPending) {
    return <EmptyActivityTable>Loading...</EmptyActivityTable>;
  }

  if (activities.isError) {
    return (
      <EmptyActivityTable>
        Error loading activities: {activities.error.message}
      </EmptyActivityTable>
    );
  }

  if (activities.data.length === 0) {
    return <EmptyActivityTable>No activities, try syncing.</EmptyActivityTable>;
  }

  return (
    <div className="w-full p-16">
      <ActivitiesCharts activities={activities.data} />
      <ActivitiesTable activities={activities.data} />
    </div>
  );
}

function EmptyActivityTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-center w-full mt-12">
      {children}
    </div>
  );
}
