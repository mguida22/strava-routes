import { useEffect, useState } from "react";
import { getActivities } from "./api";
import { Activity } from "./types";

const activities = getActivities();

type SortKey = "activity_name" | "activity_date" | "activity_type";
type SortType = "asc" | "desc";

function filterAndSortActivities(
  filterText: string,
  sortKey: SortKey,
  sortType: SortType
): Activity[] {
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

const ActivityList = () => {
  const [sortKey, setSortKey] = useState<SortKey>("activity_date");
  const [sortType, setSortType] = useState<SortType>("asc");
  const [filterText, setFilterText] = useState("");
  const [activitiesToRender, setActivitiesToRender] = useState(
    filterAndSortActivities(filterText, sortKey, sortType)
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
      filterText,
      sortKey,
      sortType
    );
    setActivitiesToRender(newActivities);
  }, [filterText, sortKey, sortType]);

  return (
    <div>
      <input
        type="text"
        placeholder="Filter activities"
        value={filterText}
        onChange={(e) => handleFilter(e.target.value)}
      />
      <table className="table-auto">
        <thead>
          <tr>
            <th onClick={() => handleSort("activity_name")}>Name</th>
            <th onClick={() => handleSort("activity_type")}>Type</th>
            <th onClick={() => handleSort("activity_date")}>Date</th>
          </tr>
        </thead>
        <tbody>
          {activitiesToRender.map((a) => (
            <tr key={a.activity_id}>
              <td>{a.activity_name}</td>
              <td>{a.activity_type}</td>
              <td>{a.activity_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityList;
