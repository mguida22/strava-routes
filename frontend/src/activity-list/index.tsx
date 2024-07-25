import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

import { getActivities } from "../api";
import { ExportActivity } from "../types";
import { useStravaApi } from "../strava/api";

type SortKey = "activity_name" | "activity_date" | "activity_type";
type SortType = "asc" | "desc";

function filterAndSortActivities(
  activities: ExportActivity[],
  filterText: string,
  sortKey: SortKey,
  sortType: SortType
): ExportActivity[] {
  const filteredActivities = activities.filter(
    (a) =>
      a.activity_name.toLowerCase().includes(filterText.toLowerCase()) ||
      a.activity_type.toLowerCase().includes(filterText.toLowerCase())
  );

  if (sortKey != null && sortType != null) {
    filteredActivities.sort((a, b) => {
      if (sortKey === "activity_date") {
        return sortType === "asc"
          ? a.activity_date_ms - b.activity_date_ms
          : b.activity_date_ms - a.activity_date_ms;
      }

      return sortType === "asc"
        ? a[sortKey].localeCompare(b[sortKey])
        : b[sortKey].localeCompare(a[sortKey]);
    });
  }

  return filteredActivities;
}

interface ActivityLoader {
  activities: ExportActivity[];
}

export async function loader(): Promise<ActivityLoader> {
  return { activities: await getActivities() };
}

function ActivityListPage() {
  const { activities } = useLoaderData() as ActivityLoader;
  const [sortKey, setSortKey] = useState<SortKey>("activity_date");
  const [sortType, setSortType] = useState<SortType>("asc");
  const [filterText, setFilterText] = useState("");
  const [activitiesToRender, setActivitiesToRender] = useState(
    filterAndSortActivities(activities, filterText, sortKey, sortType)
  );

  const handleSort = (key: SortKey) => {
    // if the key is already the sort key, toggle the sort type
    if (key === sortKey) {
      setSortType(sortType === "asc" ? "desc" : "asc");
    } else {
      setSortType("asc");
      setSortKey(key);
    }
  };

  const handleFilter = (text: string) => {
    setFilterText(text);
  };

  useEffect(() => {
    const newActivities = filterAndSortActivities(
      activities,
      filterText,
      sortKey,
      sortType
    );
    setActivitiesToRender(newActivities);
  }, [activities, filterText, sortKey, sortType]);

  return (
    <div className="w-full p-16">
      <input
        type="text"
        placeholder="Filter activities"
        value={filterText}
        onChange={(e) => handleFilter(e.target.value)}
        className="p-2 mb-4 border border-gray-300 rounded-md"
      />

      <table className="table-auto w-full">
        <thead>
          <tr>
            <th
              onClick={() => handleSort("activity_name")}
              className="text-left cursor-pointer"
            >
              Name
            </th>
            <th
              onClick={() => handleSort("activity_type")}
              className="text-left cursor-pointer"
            >
              Type
            </th>
            <th
              onClick={() => handleSort("activity_date")}
              className="text-right cursor-pointer"
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {activitiesToRender.map((a) => (
            <tr key={a.activity_id}>
              <td className="py-2">
                <Link to={`/activity/${a.activity_id}`}>{a.activity_name}</Link>
              </td>
              <td className="py-2">{a.activity_type}</td>
              <td className="py-2 text-right">{a.activity_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityListPage;
