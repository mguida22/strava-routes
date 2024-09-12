import { useMemo } from "react";
import { Activity } from "../types";
import { DateTime } from "luxon";

const getWeight = (time: number) => {
  console.log(time);
  if (time > 3600 * 4) {
    return 700;
  }

  if (time > 3600 * 3) {
    return 500;
  }

  if (time > 3600 * 1) {
    return 400;
  }

  return 300;
};

interface ActivitiesCalendarGridProps {
  activities: Activity[];
}

export function ActivitiesCalendarGrid({
  activities,
}: ActivitiesCalendarGridProps) {
  const activityTimeByDate = useMemo(() => {
    const countsByDay = {} as Record<string, number>;
    const today = DateTime.now();
    const oneYearAgo = today.minus({ years: 1 });
    for (const activity of activities) {
      const date = DateTime.fromISO(activity.start_date_local);
      if (date < oneYearAgo || date > today) {
        continue;
      }

      let isoDate = date.toISODate();
      if (isoDate != null) {
        countsByDay[isoDate] =
          countsByDay[isoDate] == null
            ? activity.moving_time
            : countsByDay[isoDate] + activity.moving_time;
      }
    }

    return countsByDay;
  }, [activities]);

  return (
    <div className="flex">
      {Array.from({ length: 53 }, (_, i) => i)
        .reverse()
        .map((week) => {
          const weekStart = DateTime.now()
            .minus({ weeks: week })
            .startOf("week");
          return (
            <div key={week}>
              {Array.from({ length: 7 }, (_, i) => i).map((day) => {
                const date = weekStart.plus({ days: day });
                const isoDate = date.toISODate();
                const time = activityTimeByDate[isoDate] ?? 0;
                const weight = getWeight(time);

                if (
                  date < DateTime.now().startOf("day").minus({ years: 1 }) ||
                  date > DateTime.now().endOf("day")
                ) {
                  return (
                    <div
                      key={day}
                      className="w-3 h-3 mb-1 mr-1 rounded bg-transparent"
                    ></div>
                  );
                }
                return (
                  <div
                    key={day}
                    className={`w-3 h-3 mb-1 mr-1 rounded-sm ${time > 0 ? `bg-orange-${weight}` : "bg-gray-200"}`}
                  />
                );
              })}
            </div>
          );
        })}
    </div>
  );
}
