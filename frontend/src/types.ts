export interface Activity {
  distance: number;
  elapsed_time: number;
  id: string;
  moving_time: number;
  name: string;
  polyline: string;
  sport_type: string;
  start_date_local: string;
  start_date_ms: number;
  strava_id: number;
}

export type ActivityRoute = GeoJSON.FeatureCollection<
  GeoJSON.LineString,
  {
    id: string;
    sport_type: string;
  }
>;
