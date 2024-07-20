import { useRef, useEffect } from "react";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWd1aWRhMjIiLCJhIjoiY2x5NmZ2NWtzMDlsZTJrb3VhM202M2lzNCJ9.wOPjmRNcUEXtQXE8zBirlw";

const DEFAULT_PADDING = 0.02;

function getBoundingBoxFromFeatureCollection(
  geojson: GeoJSON.FeatureCollection<GeoJSON.Point>
): LngLatBoundsLike {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (let feature of geojson.features) {
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

interface ActivityMapProps {
  activityGeojson: GeoJSON.FeatureCollection<GeoJSON.Point>;
}

export default function ActivityMap({ activityGeojson }: ActivityMapProps) {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? "",
      style: "mapbox://styles/mapbox/outdoors-v12",
      bounds: getBoundingBoxFromFeatureCollection(activityGeojson),
      zoom: 11,
      attributionControl: false,
    });

    map.current.on("load", async () => {
      if (map.current === null) return;

      map.current.addSource("route-source", {
        type: "geojson",
        data: activityGeojson,
      });

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
            0,
            "green",
            40,
            "yellow",
            100,
            "red",
          ],
        },
      });
    });
  });

  return <div ref={mapContainer} className="h-full w-full" />;
}
