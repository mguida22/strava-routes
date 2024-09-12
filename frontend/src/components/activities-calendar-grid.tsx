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

// function makeCountsByDayByWeek() {
//   const countsByDayByWeek = {} as Record<string, Record<string, number>>;
//   let today = DateTime.now();
//   let oneYearAgo = DateTime.now().minus({ years: 1 });
//   let curr = oneYearAgo;
//   while (curr < today) {
//     let week = curr.startOf("week").toISODate();
//     if (countsByDayByWeek[week] == null) {
//       countsByDayByWeek[week] = {};
//     }

//     let isoDate = curr.toISODate();
//     if (isoDate != null) {
//       countsByDayByWeek[week][isoDate] = 0;
//     }

//     curr = curr.plus({ days: 1 });
//   }

//   return countsByDayByWeek;
// }

export function ActivitiesCalendarGrid({
  activities,
}: ActivitiesCalendarGridProps) {
  // const activityCountByDate = useMemo(() => {
  //   const countsByDayByWeek = makeCountsByDayByWeek();

  //   let today = DateTime.now();
  //   let oneYearAgo = today.minus({ years: 1 });
  //   for (const activity of activities) {
  //     const date = DateTime.fromISO(activity.start_date_local);
  //     if (date < oneYearAgo || date > today.minus({ months: 11 })) {
  //       continue;
  //     }

  //     let isoDate = date.toISODate();
  //     let week = date.startOf("week").toISODate();
  //     if (isoDate != null && week != null) {
  //       console.log(week, isoDate, countsByDayByWeek[week]);
  //       countsByDayByWeek[week][isoDate] += 1;
  //     }
  //   }

  //   console.log(countsByDayByWeek);
  //   return countsByDayByWeek;
  // }, [activities]);

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
    <div className="flex border border-gray-300">
      {Array.from({ length: 53 }, (_, i) => i)
        .reverse()
        .map((week) => {
          const weekStart = DateTime.now()
            .minus({ weeks: week })
            .startOf("week");
          return (
            <div
              key={week}
              className="flex flex-col justify-center items-center"
            >
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
                    <div key={day} className="w-4 h-4 bg-transparent"></div>
                  );
                }
                return (
                  <div
                    key={day}
                    className={`text-sm w-4 h-4 ${count > 0 ? `bg-orange-${weight}` : "bg-gray-100"}`}
                  />
                );
              })}
            </div>
          );
        })}
    </div>
  );
}
