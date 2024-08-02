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

    for (let coord of coords) {
      minLat = Math.min(minLat, coord[1] - DEFAULT_PADDING);
      maxLat = Math.max(maxLat, coord[1] + DEFAULT_PADDING);
      minLon = Math.min(minLon, coord[0] - DEFAULT_PADDING);
      maxLon = Math.max(maxLon, coord[0] + DEFAULT_PADDING);
    }
  }

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
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

    map.current.on("load", () => {
      if (map.current === null) return;

      map.current.addSource("route-source", {
        type: "geojson",
        data: geojsonFromActivityPaths(activityPaths),
      });

      map.current.addLayer({
        id: "route-layer",
        source: "route-source",
        type: "line",
        paint: {
          "line-color": "orange",
          "line-width": 4,
        },
      });

      const bounds = getBoundingBoxFromFeatureCollections(activityPaths);
      if (bounds) {
        map.current.fitBounds(bounds, {
          padding: 20,
        });
      }

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    });
  }, []);

  useEffect(() => {
    if (map.current === null) return;

    const source = map.current.getSource("route-source") as GeoJSONSource;
    if (source == null) return;

    source.setData(geojsonFromActivityPaths(activityPaths));

    const bounds = getBoundingBoxFromFeatureCollections(activityPaths);
    if (bounds != null) {
      map.current.fitBounds(bounds, {
        padding: 20,
      });
    }
  }, [activityPaths]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
