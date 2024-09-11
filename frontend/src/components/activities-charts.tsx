import { Activity } from "../types";
import { useMemo } from "react";
import getNameForSport from "../utils/get-name-for-sport-type";

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

  return (
    <>
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(activitiesBySport).map(([sport, activities]) => {
            return (
              <div key={sport} className="space-y-4">
                <p>
                  {getNameForSport(sport)}: {activities.length}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
