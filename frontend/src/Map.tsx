import { useRef, useEffect } from "react";
import mapboxgl, { LngLatBoundsLike, GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ActivityPath } from "./types";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWd1aWRhMjIiLCJhIjoiY2x5NmZ2NWtzMDlsZTJrb3VhM202M2lzNCJ9.wOPjmRNcUEXtQXE8zBirlw";

const DEFAULT_PADDING = 0.02;

function getBoundingBoxFromFeatureCollections(
  paths: ActivityPath[]
): LngLatBoundsLike | undefined {
  if (paths.length === 0) return undefined;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  const path = paths[0];
  for (let feature of path.features) {
    const coords = feature.geometry.coordinates;

    minLat = Math.min(minLat, coords[1] - DEFAULT_PADDING);
    maxLat = Math.max(maxLat, coords[1] + DEFAULT_PADDING);
    minLon = Math.min(minLon, coords[0] - DEFAULT_PADDING);
    maxLon = Math.max(maxLon, coords[0] + DEFAULT_PADDING);
  }

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}

function getElevationBounds(paths: ActivityPath[]) {
  if (paths.length === 0) return { low: 0, middle: 0, high: 0 };

  let low = Infinity;
  let high = -Infinity;

  for (let path of paths) {
    if (path.features == null) continue;

    for (let feature of path.features) {
      const ele = feature.properties?.ele;
      if (ele == null) continue;

      low = Math.min(low, ele);
      high = Math.max(high, ele);
    }
  }

  const middle = Math.floor((low + high) / 2);

  return { low, middle, high };
}

function geojsonFromActivityPaths(
  paths: ActivityPath[]
): GeoJSON.FeatureCollection {
  const features =
    paths.length > 0 ? paths.flatMap((path) => path.features) : [];
  return {
    type: "FeatureCollection",
    features,
  };
}

interface ActivityMapProps {
  activityPaths: ActivityPath[];
}

export default function ActivityMap({ activityPaths }: ActivityMapProps) {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? "",
      style: "mapbox://styles/mapbox/outdoors-v12",
      bounds: getBoundingBoxFromFeatureCollections(activityPaths),
      zoom: 11,
      attributionControl: false,
    });
  }, []);

  useEffect(() => {
    if (map.current === null) return;
    if (activityPaths.length === 0) return;

    const routeSource = map.current.getSource("route-source") as GeoJSONSource;
    if (routeSource != null) {
      routeSource.setData(geojsonFromActivityPaths(activityPaths));
    } else {
      map.current.addSource("route-source", {
        type: "geojson",
        data: geojsonFromActivityPaths(activityPaths),
      });
    }

    // const routeLayer = map.current.getLayer("route-layer");
    // if (routeLayer != null) {
    //   map.current.removeLayer("route-layer");
    // }
    const { low, middle, high } = getElevationBounds(activityPaths);
    map.current.addLayer({
      id: "route-layer",
      source: "route-source",
      type: "circle",
      paint: {
        "circle-radius": 5,
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "ele"],
          low,
          "#fff33b",
          middle,
          "#f3903f",
          high,
          "#e93e3a",
        ],
      },
    });

    const bounds = getBoundingBoxFromFeatureCollections(activityPaths);
    if (bounds) {
      map.current.fitBounds(bounds, {
        padding: 20,
      });
    }
  }, [activityPaths]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
