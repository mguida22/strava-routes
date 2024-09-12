import { Activity } from "../types";
import { useMemo } from "react";
import getNameForSport from "../utils/get-name-for-sport-type";
import { formatDistance } from "../utils/formatters";
import { ActivitiesCalendarGrid } from "./activities-calendar-grid";

interface ActivitiesChartsProps {
  activities: Activity[];
}

export function ActivitiesCharts({ activities }: ActivitiesChartsProps) {
  const activitiesBySport = useMemo(() => {
    const grouped = activities.reduce(
      (acc, activity) => {
        if (acc[activity.sport_type] == null) {
          acc[activity.sport_type] = [];
        }

        acc[activity.sport_type].push(activity);

        return acc;
      },
      {} as Record<string, Activity[]>
    );

    const sortedActivities = Object.entries(grouped).sort(
      (a, b) => b[1].length - a[1].length
    );
    return Object.fromEntries(sortedActivities);
  }, [activities]);

  const [lastMonthDistance, lastYearDistance, totalDistance] = useMemo(() => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const lastMonthDistance = activities
      .filter((activity) => new Date(activity.start_date_local) > lastMonth)
      .reduce((acc, activity) => acc + activity.distance, 0);

    const lastYearDistance = activities
      .filter((activity) => new Date(activity.start_date_local) > lastYear)
      .reduce((acc, activity) => acc + activity.distance, 0);

    const totalDistance = activities.reduce(
      (acc, activity) => acc + activity.distance,
      0
    );

    return [lastMonthDistance, lastYearDistance, totalDistance];
  }, [activities]);

  return (
    <>
      <h1 className="text-2xl font-bold">Activity Stats</h1>

      <ActivitiesCalendarGrid activities={activities} />

      <h2 className="text-lg font-bold mt-4">Distance</h2>
      <div>
        <p>Last month distance: {formatDistance(lastMonthDistance)}</p>
        <p>Last year distance: {formatDistance(lastYearDistance)}</p>
        <p>Total distance: {formatDistance(totalDistance)}</p>
      </div>

      <h2 className="text-lg font-bold mt-4">Activities</h2>
      <p>Total activities: {activities.length}</p>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(activitiesBySport).map(([sport, activities]) => {
          return (
            <div key={sport}>
              <p>
                {getNameForSport(sport)}: {activities.length}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
