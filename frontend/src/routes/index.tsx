import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity } from "../types";
import { useEffect, useState } from "react";
import { formatDateTime } from "../utils/formatters";
import { useActivities } from "../api";
import { useUser } from "../user-provider";

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

  return <ActivityTable activities={activities.data} />;
}

function EmptyActivityTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center items-center w-full mt-12">
      {children}
    </div>
  );
}

interface ActivityTableProps {
  activities: Activity[];
}

function ActivityTable({ activities }: ActivityTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("start_date_ms");
  const [sortType, setSortType] = useState<SortType>("desc");
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
              onClick={() => handleSort("name")}
              className="text-left cursor-pointer"
            >
              Name
            </th>
            <th
              onClick={() => handleSort("sport_type")}
              className="text-left cursor-pointer"
            >
              Type
            </th>
            <th
              onClick={() => handleSort("start_date_ms")}
              className="text-right cursor-pointer"
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {activitiesToRender.map((a) => (
            <tr key={a.id}>
              <td className="py-2">
                <Link to={`/activity/${a.id}`}>{a.name}</Link>
              </td>
              <td className="py-2">{a.sport_type}</td>
              <td className="py-2 text-right">
                {formatDateTime(a.start_date_local)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type SortKey = "name" | "start_date_ms" | "sport_type";
type SortType = "asc" | "desc";

function filterAndSortActivities(
  activities: Activity[],
  filterText: string,
  sortKey: SortKey,
  sortType: SortType
): Activity[] {
  const filteredActivities = activities.filter(
    (a) =>
      a.name.toLowerCase().includes(filterText.toLowerCase()) ||
      a.sport_type.toLowerCase().includes(filterText.toLowerCase())
  );

  if (sortKey != null && sortType != null) {
    filteredActivities.sort((a, b) => {
      if (sortKey === "start_date_ms") {
        return sortType === "asc"
          ? a.start_date_ms - b.start_date_ms
          : b.start_date_ms - a.start_date_ms;
      }

      return sortType === "asc"
        ? a[sortKey].localeCompare(b[sortKey])
        : b[sortKey].localeCompare(a[sortKey]);
    });
  }

  return filteredActivities;
}
