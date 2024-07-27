package database

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type coordinates struct {
	Latitude  float64 `bson:"latitude,omitempty"`
	Longitude float64 `bson:"longitude,omitempty"`
}

type Activity struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	CreatedAt time.Time          `bson:"created_at,omitempty"`
	UpdatedAt time.Time          `bson:"updated_at,omitempty"`

	// From Strava API
	AthleteID            string      `bson:"athlete_id,omitempty"`
	AverageCadence       float64     `bson:"average_cadence,omitempty"`
	AverageHeartrate     float64     `bson:"average_heartrate,omitempty"`
	AverageSpeed         float64     `bson:"average_speed,omitempty"`
	AverageWatts         float64     `bson:"average_watts,omitempty"`
	Calories             float64     `bson:"calories,omitempty"`
	Commute              bool        `bson:"commute,omitempty"`
	Description          string      `bson:"description,omitempty"`
	DeviceWatts          bool        `bson:"device_watts,omitempty"`
	Distance             float64     `bson:"distance,omitempty"`
	ElapsedTime          int         `bson:"elapsed_time,omitempty"`
	ElevHigh             float64     `bson:"elev_high,omitempty"`
	ElevLow              float64     `bson:"elev_low,omitempty"`
	EndLatLng            coordinates `bson:"end_latlng,omitempty"`
	ExternalID           string      `bson:"external_id,omitempty"`
	HasHeartrate         bool        `bson:"has_heartrate,omitempty"`
	HasKudoed            bool        `bson:"has_kudoed,omitempty"`
	Kilojoules           float64     `bson:"kilojoules,omitempty"`
	LocationCity         string      `bson:"location_city,omitempty"`
	LocationCountry      string      `bson:"location_country,omitempty"`
	LocationState        string      `bson:"location_state,omitempty"`
	Manual               bool        `bson:"manual,omitempty"`
	MaxHeartrate         int         `bson:"max_heartrate,omitempty"`
	MaxSpeed             int         `bson:"max_speed,omitempty"`
	MaxWatts             int         `bson:"max_watts,omitempty"`
	MovingTime           int         `bson:"moving_time,omitempty"`
	Name                 string      `bson:"name,omitempty"`
	Polyline             string      `bson:"polyline,omitempty"`
	PRCount              int         `bson:"pr_count,omitempty"`
	Private              bool        `bson:"private,omitempty"`
	SportType            string      `bson:"sport_type,omitempty"`
	StartDate            string      `bson:"start_date,omitempty"`
	StartDateLocal       string      `bson:"start_date_local,omitempty"`
	StartLatLng          coordinates `bson:"start_latlng,omitempty"`
	StravaID             int         `bson:"strava_id,omitempty"`
	SufferScore          int         `bson:"suffer_score,omitempty"`
	SummaryPolyline      string      `bson:"summary_polyline,omitempty"`
	Timezone             string      `bson:"timezone,omitempty"`
	TotalElevationGain   int         `bson:"total_elevation_gain,omitempty"`
	TotalPhotoCount      int         `bson:"total_photo_count,omitempty"`
	Trainer              bool        `bson:"trainer,omitempty"`
	Type                 string      `bson:"type,omitempty"`
	UTCOffset            int         `bson:"utc_offset,omitempty"`
	WeightedAverageWatts int         `bson:"weighted_average_watts,omitempty"`
	WorkoutType          string      `bson:"workout_type,omitempty"`
}

type Athlete struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty"`
	CreatedAt            time.Time          `bson:"created_at,omitempty"`
	UpdatedAt            time.Time          `bson:"updated_at,omitempty"`
	AccessToken          string             `bson:"access_token"`
	AccessTokenExpiresAt int                `bson:"access_token_expires_at"`
	RefreshToken         string             `bson:"refresh_token"`

	// From Strava API
	StravaID    int                  `bson:"strava_id,omitempty"`
	Username    string               `bson:"username,omitempty"`
	Firstname   string               `bson:"firstname,omitempty"`
	Lastname    string               `bson:"lastname,omitempty"`
	City        string               `bson:"city,omitempty"`
	State       string               `bson:"state,omitempty"`
	Country     string               `bson:"country,omitempty"`
	ActivityIds []primitive.ObjectID `bson:"activity_ids,omitempty"`
}
