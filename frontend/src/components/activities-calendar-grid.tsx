import { useMemo } from "react";
import { Activity } from "../types";
import { DateTime } from "luxon";

function getWeight(count: number) {
  if (count < 2) {
    return 300;
  }

  if (count < 3) {
    return 400;
  }

  return 700;
}

interface ActivitiesCalendarGridProps {
  activities: Activity[];
}

export function ActivitiesCalendarGrid({
  activities,
}: ActivitiesCalendarGridProps) {
  const activityCountByDate = useMemo(() => {
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
          countsByDay[isoDate] == null ? 1 : countsByDay[isoDate] + 1;
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
                const count = activityCountByDate[isoDate] ?? 0;
                const weight = getWeight(count);
                console.log(isoDate, count);

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
                    className={`w-3 h-3 mb-1 mr-1 rounded-sm ${count > 0 ? `bg-orange-${weight}` : "bg-gray-200"}`}
                  />
                );
              })}
            </div>
          );
        })}
    </div>
  );
}
