import { useRef, useEffect } from "react";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import "./Map.css";
import "mapbox-gl/dist/mapbox-gl.css";

import activityJson from "../public/activity.json";

const activityGeojson = activityJson as unknown as GeoJSON.FeatureCollection;

mapboxgl.accessToken =
  "pk.eyJ1IjoibWd1aWRhMjIiLCJhIjoiY2x5NmZ2NWtzMDlsZTJrb3VhM202M2lzNCJ9.wOPjmRNcUEXtQXE8zBirlw";

function getBoundingBoxFromGeoJson(
  geojson: GeoJSON.FeatureCollection
): LngLatBoundsLike {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (let feature of geojson.features) {
    if (feature.geometry.type !== "Point") {
      continue;
    }
    const coords = feature.geometry.coordinates;
    minLat = Math.min(minLat, coords[1]);
    maxLat = Math.max(maxLat, coords[1]);
    minLon = Math.min(minLon, coords[0]);
    maxLon = Math.max(maxLon, coords[0]);
  }

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}

export default function Map() {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? "",
      style: "mapbox://styles/mapbox/outdoors-v12",
      bounds: getBoundingBoxFromGeoJson(activityGeojson),
      zoom: 11,
      attributionControl: false,
    });

    map.current.on("load", async () => {
      map.current?.addSource("route", {
        type: "geojson",
        data: activityGeojson,
      });

      map.current?.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "orange",
          "line-width": 4,
        },
      });
    });
  });

  return (
    <div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
