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

/** A strava activity as represented by the Strava API */
export interface StravaApiActivity {
  resource_state: number;
  athlete: {
    id: number;
    resource_state: number;
  };
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  workout_type: null | string;
  id: number;
  external_id: string;
  upload_id: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  start_latlng: null | {
    lat: number;
    lng: number;
  };
  end_latlng: null | {
    lat: number;
    lng: number;
  };
  location_city: null | string;
  location_state: null | string;
  location_country: string;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline: null | string;
    resource_state: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  gear_id: string;
  from_accepted_tag: boolean;
  average_speed: number;
  max_speed: number;
  average_cadence: number;
  average_watts: number;
  weighted_average_watts: number;
  kilojoules: number;
  device_watts: boolean;
  has_heartrate: boolean;
  average_heartrate: number;
  max_heartrate: number;
  max_watts: number;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
  suffer_score: number;
}

/** A strava activity as represented by the Strava Export */
export interface StravaExportActivity {
  activity_id: string;
  activity_date: string;
  activity_date_ms: number;
  activity_name: string;
  activity_type: string;
  activity_description: string;
  elapsed_time: string;
  distance: string;
  max_heart_rate: string;
  relative_effort: string;
  commute: string;
  activity_private_note: string;
  activity_gear: string;
  filename: string;
  athlete_weight: string;
  bike_weight: string;
  elapsed_time_1: string;
  moving_time: string;
  distance_1: string;
  max_speed: string;
  average_speed: string;
  elevation_gain: string;
  elevation_loss: string;
  elevation_low: string;
  elevation_high: string;
  max_grade: string;
  average_grade: string;
  average_positive_grade: string;
  average_negative_grade: string;
  max_cadence: string;
  average_cadence: string;
  max_heart_rate_1: string;
  average_heart_rate: string;
  max_watts: string;
  average_watts: string;
  calories: string;
  max_temperature: string;
  average_temperature: string;
  relative_effort_1: string;
  total_work: string;
  number_of_runs: string;
  uphill_time: string;
  downhill_time: string;
  other_time: string;
  perceived_exertion: string;
  type: string;
  start_time: string;
  weighted_average_power: string;
  power_count: string;
  prefer_perceived_exertion: string;
  perceived_relative_effort: string;
  commute_1: string;
  total_weight_lifted: string;
  from_upload: string;
  grade_adjusted_distance: string;
  weather_observation_time: string;
  weather_condition: string;
  weather_temperature: string;
  apparent_temperature: string;
  dewpoint: string;
  humidity: string;
  weather_pressure: string;
  wind_speed: string;
  wind_gust: string;
  wind_bearing: string;
  precipitation_intensity: string;
  sunrise_time: string;
  sunset_time: string;
  moon_phase: string;
  bike: string;
  gear: string;
  precipitation_probability: string;
  precipitation_type: string;
  cloud_cover: string;
  weather_visibility: string;
  uv_index: string;
  weather_ozone: string;
  jump_count: string;
  total_grit: string;
  average_flow: string;
  flagged: string;
  average_elapsed_speed: string;
  dirt_distance: string;
  newly_explored_distance: string;
  newly_explored_dirt_distance: string;
  activity_count: string;
  total_steps: string;
  carbon_saved: string;
  pool_length: string;
  training_load: string;
  intensity: string;
  average_grade_adjusted_pace: string;
  timer_time: string;
  total_cycles: string;
  media: string;
}
