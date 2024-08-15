import { decode as decodePolyline } from "@googlemaps/polyline-codec";
import { useRef, useEffect, useMemo } from "react";
import mapboxgl, { LngLatBoundsLike, GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Activity, ActivityRoute } from "../types";

mapboxgl.accessToken =
  "pk.eyJ1IjoibWd1aWRhMjIiLCJhIjoiY2x5NmZ2NWtzMDlsZTJrb3VhM202M2lzNCJ9.wOPjmRNcUEXtQXE8zBirlw";

const DEFAULT_PADDING = 0.02;

function activityToActivityRoute(activity: Activity): ActivityRoute {
  // decode into LatLng, then reverse order for Mapbox
  const coordinates = decodePolyline(activity.polyline).map(([lat, lng]) => [
    lng,
    lat,
  ]);

  const route = {
    type: "FeatureCollection",
    properties: {},
    features: [
      {
        type: "Feature",
        properties: {
          id: activity.id,
          sport_type: activity.sport_type,
        },
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    ],
  } as ActivityRoute;

  return route;
}

function getBoundingBoxFromFeatureCollections(
  routes: ActivityRoute[]
): LngLatBoundsLike | undefined {
  if (routes.length === 0) return undefined;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  const route = routes[0];
  for (let feature of route.features) {
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

function geojsonFromActivityRoutes(
  routes: ActivityRoute[]
): GeoJSON.FeatureCollection {
  const features =
    routes.length > 0 ? routes.flatMap((route) => route.features) : [];
  return {
    type: "FeatureCollection",
    features,
  };
}

interface ActivityMapProps {
  activities: Activity[];
}

export default function ActivityMap({ activities }: ActivityMapProps) {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const activityRoutes = useMemo(
    () =>
      activities
        // some activities don't have routes associated with them
        .filter((a) => a.polyline.length > 0)
        .map(activityToActivityRoute),
    [activities]
  );

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? "",
      style: "mapbox://styles/mapbox/outdoors-v12",
      bounds: getBoundingBoxFromFeatureCollections(activityRoutes),
      zoom: 11,
      attributionControl: false,
    });

    map.current.on("load", () => {
      if (map.current === null) return;

      map.current.addSource("route-source", {
        type: "geojson",
        data: geojsonFromActivityRoutes(activityRoutes),
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

      const bounds = getBoundingBoxFromFeatureCollections(activityRoutes);
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

    source.setData(geojsonFromActivityRoutes(activityRoutes));

    const bounds = getBoundingBoxFromFeatureCollections(activityRoutes);
    if (bounds != null) {
      map.current.fitBounds(bounds, {
        padding: 20,
      });
    }
  }, [activities]);

  return <div ref={mapContainer} className="h-full w-full" />;
}
